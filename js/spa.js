//spa.js
//root namespace module

/********** BEGIN MY IMPRESSIONS ************/
/* this appears to to be extremely minimal and usable for any spa. seems we always delegate the real work to the shell. */
/********** END MY IMPRESSIONS ************/

/*jslint
 browser: true, continue: true
  devel: true,   indent: 2,      maxerr: 50,
 newcap: true,    nomen: true, plusplus: true,
 regexp: true,   sloppy: true,     vars: false,
  white: true
 */
/*global $, spa:true */

var spa = (function(){
    var initModule = function($container){
        spa.shell.initModule($container);
    };
    return {initModule: initModule};
}());