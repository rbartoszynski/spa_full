//spa.shell.js
//shell module for spa

/********** BEGIN MY IMPRESSIONS ************/
/* still not entirely sure what the scope of this should be. some of the code may be moved out..don't know.
* books says:
* Rendering and managing feature containers. I SEE: rendering. managing? Perhaps; managing by delegating to feature modules is a form of managing.
* Managing the application state. I SEE: Yup. We use the URI Anchor convention for managing application state.
* Coordinating feature modules. I SEE: Sure. We initialize modules. And any communication that needs to happen between them should be facilitated by the shell.
*
* so, in other words: the shell makes the app GO by dealing with application state and delegating work to feature modules. In delegating to feature modules there
* still exists work in coordinating work between multiple feature modules and configuring the feature modules correctly.
*/
 /********** END MY IMPRESSIONS ************/

/*jslint browser:true, continue: true, devel:true, indent:2,
maxerr: 50, newcap: true, nomen: true, plusplus: true,
regexp: true, sloppy: true, vars: false, white: true
 */
/*global $, spa*/

spa.shell = (function() {

    var configMap = {
            anchor_schema_map: {
                chat: {
                    open: true,
                    closed: true
                }
            },
            main_html: String()
            + '    <div_bar id="spa">'
            + '    <div_bar class="spa-shell-head">'
            + '    <div_bar class="spa-shell-head-logo"></div_bar>'
            + '    <div_bar class="spa-shell-head-acct"></div_bar>'
            + '    <div_bar class="spa-shell-head-search"></div_bar>'
            + '    </div_bar>'
            + '    <div_bar class="spa-shell-main">'
            + '    <div_bar class="spa-shell-main-nav"></div_bar>'
            + '    <div_bar class="spa-shell-main-content"></div_bar>'
            + '    </div_bar>'
            + '    <div_bar class="spa-shell-foot"></div_bar>'
            + '    <div_bar class="spa-shell-chat"></div_bar>'
            + '    <div_bar class="spa-shell-modal"></div_bar>'
            + '    </div_foo>',
            chat_extend_time: 1000,
            chat_retract_time: 300,
            chat_extend_height: 450,
            chat_retract_height: 15,
            chat_extended_title: "Click to retract",
            chat_retracted_title: "Click to extend"
        },

        stateMap = {
            anchor_map: {},
            $container: null,
            is_chat_retracted: true
        },
        jqueryMap = {},

        copyAnchorMap, setjqueryMap, toggleChat, changeAnchorPart, onHashchange, onClickChat, initModule;

    //------------------------------BEGIN UTILITY METHODS------------------------------//
    // Returns copy of stored anchor map; minimizes overhead
    copyAnchorMap = function () {
        return $.extend( true, {}, stateMap.anchor_map );
    };
    //------------------------------END UTILITY METHODS------------------------------//

    //------------------------------BEGIN DOM METHODS------------------------------//


    //Begin DOM method /setjqueryMap/
    setjqueryMap = function () {
        var $container = stateMap.$container;
        jqueryMap = {
            $container: $container,
            $chat: $container.find(".spa-shell-chat")
        };
    };

    //Begin DOM method /toggleChat/
    // Purpose   : Extends or retracts chat slider
    // Arguments :
    //   * do_extend - if true, extends slider; if false retracts
    //   * callback  - optional function to execute at end of animation
    // Settings  :
    //   * chat_extend_time, chat_retract_time
    //   * chat_extend_height, chat_retract_height
    // Returns   : boolean
    //   * true  - slider animation activated
    //   * false - slider animation not activated //
    // State     : sets stateMap.is_chat_retracted
    //   * true  - slider is retracted
    //   * false - slider is extended
    //
    toggleChat = function (do_extend, callback) {
        var
            px_chat_ht = jqueryMap.$chat.height(),
            is_open = px_chat_ht === configMap.chat_extend_height,
            is_closed = px_chat_ht === configMap.chat_retract_height,
            is_sliding = !(is_open || is_closed);

        //avoid race condition
        if (is_sliding) {
            return false;
        }

        if (do_extend) {
            jqueryMap.$chat.animate(
                {height: configMap.chat_extend_height},
                configMap.chat_extend_time,
                function () {
                    jqueryMap.$chat.attr('title', configMap.chat_extended_title);
                    stateMap.is_chat_retracted = false;
                    if (callback) {
                        callback(jqueryMap.$chat);
                    }
                }
            );
            return true;
        }
        //Begin Retract Slider
        jqueryMap.$chat.animate(
            {height: configMap.chat_retract_height},
            configMap.chat_retract_time,
            function () {
                jqueryMap.$chat.attr('title', configMap.chat_retracted_title);
                stateMap.is_chat_retracted = true;
                if (callback) {
                    callback(jqueryMap.$chat);
                }
            }
        );
        return true;
        //End Retract Slider
    };
    //End DOM method /toggleChat/

    //
    //Begin DOM method /changeAnchorPart/
    //Purpose : Changes part of the URI anchor component
    //Arguments:
    //    * arg_map - The map describing what part of the URI anchor
    //we want changed.
    //    Returns : boolean
    //* true - the Anchor portion of the URI was update
    //* false - the Anchor portion of the URI could not be updated
    //Action :
    //    The current anchor rep stored in stateMap.anchor_map.
    //    See uriAnchor for a discussion of encoding.
    //    This method
    //* Creates a copy of this map using copyAnchorMap().
    //* Modifies the key-values using arg_map.
    //* Manages the distinction between independent
    //and dependent values in the encoding.
    //*Attempts to change teh URI using uriAnchor
    //Returns true on success, and false on failure.
    //

    changeAnchorPart = function ( arg_map ) {
        var
            anchor_map_revise = copyAnchorMap(),
            bool_return = true,
            key_name, key_name_dep;
// Begin merge changes into anchor map
        KEYVAL:
            for ( key_name in arg_map ) {
                if ( arg_map.hasOwnProperty( key_name ) ) {
                    // skip dependent keys during iteration
                    if ( key_name.indexOf( '_' ) === 0 ) { continue KEYVAL; }
                    // update independent key value
                    anchor_map_revise[key_name] = arg_map[key_name];
                    // update matching dependent key
                    key_name_dep = '_' + key_name;
                    if ( arg_map[key_name_dep] ) {
                        anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
                    }
                    else {
                        delete anchor_map_revise[key_name_dep];
                        delete anchor_map_revise['_s' + key_name_dep];
                    } }
            }

        // End merge changes into anchor map
        // Begin attempt to update URI; revert if not successful
        try {
            $.uriAnchor.setAnchor( anchor_map_revise );
        }
        catch ( error ) {
            // replace URI with existing state
            $.uriAnchor.setAnchor( stateMap.anchor_map,null,true );
            bool_return = false;
        }
        // End attempt to update URI...
        return bool_return;
    };
// End DOM method /changeAnchorPart/

    //End DOM method /setjqueryMap/
    //------------------------------END DOM METHODS------------------------------//

    //------------------------------BEGIN EVENT HANDLERS------------------------------//

// Begin Event handler /onHashchange/
// Purpose : Handles the hashchange event
// Arguments:
//   * event - jquery event object.
// Settings : none
// Returns  : false
// Action   :
//   * Parses the URI anchor component

    //   * Compares proposed application state with current
//   * Adjust the application only where proposed state
//     differs from existing
//
    onHashchange = function ( event ) {
        var
            anchor_map_previous = copyAnchorMap(),
            anchor_map_proposed,
            _s_chat_previous, _s_chat_proposed,
            s_chat_proposed;
        // attempt to parse anchor
        try { anchor_map_proposed = $.uriAnchor.makeAnchorMap(); }
        catch ( error ) {
            $.uriAnchor.setAnchor( anchor_map_previous, null, true );
            return false;
        }
        stateMap.anchor_map = anchor_map_proposed;
        // convenience vars
        _s_chat_previous = anchor_map_previous._s_chat;
        _s_chat_proposed = anchor_map_proposed._s_chat;
        // Begin adjust chat component if changed
        if ( ! anchor_map_previous
            || _s_chat_previous !== _s_chat_proposed ){
            s_chat_proposed = anchor_map_proposed.chat;
            switch ( s_chat_proposed ) {
                case 'open' :
                    toggleChat( true );
                    break;
                case 'closed' :
                    toggleChat( false );
                    break;
                default :
                    toggleChat( false );
                    delete anchor_map_proposed.chat;
                    $.uriAnchor.setAnchor( anchor_map_proposed, null, true );
            } }
        // End adjust chat component if changed
        return false;
    };
// End Event handler /onHashchange/

    //Begin Event handler /onClickChat/
    onClickChat = function () {
        changeAnchorPart({
            chat: (stateMap.is_chat_retracted ? 'open' : 'closed')
        });
        return false; //stops bubbling, stops default action
    };
    //End Event handler /onClickChat/

    //------------------------------END EVENT HANDLERS------------------------------//

    //------------------------------BEGIN PUBLIC METHODS------------------------------//
    //Begin Public method /initModule/
    initModule = function ($container) {
        stateMap.$container = $container;
        $container.html(configMap.main_html);
        setjqueryMap();

        //Begin initialize chat slider
        stateMap.is_chat_retracted = true;
        jqueryMap.$chat
            .attr("title", configMap.chat_retracted_title)
            .click(onClickChat);
        //End initialize chat slider

        //configure uriAnchor to use our schema
        $.uriAnchor.configModule({
            schema_map: configMap.anchor_schema_map
        });

        // configure and initialize feature modules
        spa.chat.configModule({});
        spa.chat.initModule(jqueryMap.$chat);

        // Handle URI anchor change events.
        // This is done /after/ all feature modules are configured
        // and initialized, otherwise they will not be ready to handle
        // the trigger event, which is used to ensure the anchor
        // is considered on-load
        //
        $(window)
            .bind('hashchange', onHashchange)
            .trigger('hashchange');

    };


    //End Public method /initModule/

    return {initModule: initModule};
    //------------------------------END PUBLIC METHODS------------------------------//
}());