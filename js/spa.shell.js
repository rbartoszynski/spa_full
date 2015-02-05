//spa.shell.js
//shell module for spa

/*jslint browser:true, continue: true, devel:true, indent:2,
maxerr: 50, newcap: true, nomen: true, plusplus: true,
regexp: true, sloppy: true, vars: false, white: true
 */
/*global $, spa*/

spa.shell = (function() {

    var configMap = {
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
            $container: null,
            is_chat_retracted: true
        },
        jQueryMap = {},

        setJqueryMap, toggleChat, onClickChat, initModule;

    //------------------------------BEGIN UTILITY METHODS------------------------------//
    //------------------------------END UTILITY METHODS------------------------------//

    //------------------------------BEGIN DOM METHODS------------------------------//
    //Begin DOM method /setJqueryMap/
    setJqueryMap = function () {
        var $container = stateMap.$container;
        jQueryMap = {
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
            px_chat_ht = jQueryMap.$chat.height(),
            is_open = px_chat_ht === configMap.chat_extend_height,
            is_closed = px_chat_ht === configMap.chat_retract_height,
            is_sliding = !(is_open || is_closed);

        //avoid race condition
        if (is_sliding) {
            return false;
        }

        if (do_extend) {
            jQueryMap.$chat.animate(
                {height: configMap.chat_extend_height},
                configMap.chat_extend_time,
                function () {
                    jQueryMap.$chat.attr('title', configMap.chat_extended_title);
                    stateMap.is_chat_retracted = false;
                    if (callback) {
                        callback(jQueryMap.$chat);
                    }
                }
            );
            return true;
        }
        //Begin Retract Slider
        jQueryMap.$chat.animate(
            {height: configMap.chat_retract_height},
            configMap.chat_retract_time,
            function () {
                jQueryMap.$chat.attr('title', configMap.chat_retracted_title);
                stateMap.is_chat_retracted = true;
                if (callback) {
                    callback(jQueryMap.$chat);
                }
            }
        );
        return true;
        //End Retract Slider
    };
    //End DOM method /toggleChat/

    //End DOM method /setJqueryMap/
    //------------------------------END DOM METHODS------------------------------//

    //------------------------------BEGIN EVENT HANDLERS------------------------------//
    onClickChat = function () {
        toggleChat(stateMap.is_chat_retracted);
        return false; //stops bubbling, stops default action
    };
    //------------------------------END EVENT HANDLERS------------------------------//

    //------------------------------BEGIN PUBLIC METHODS------------------------------//
    //Begin Public method /initModule/
    initModule = function ($container) {
        stateMap.$container = $container;
        $container.html(configMap.main_html);
        setJqueryMap();

        //Begin initialize chat slider
        stateMap.is_chat_retracted = true;
        jQueryMap.$chat
            .attr("title", configMap.chat_retracted_title)
            .click(onClickChat);
        //End initialize chat slider
    };
    //End Public method /initModule/

    return {initModule: initModule};
    //------------------------------END PUBLIC METHODS------------------------------//
}());