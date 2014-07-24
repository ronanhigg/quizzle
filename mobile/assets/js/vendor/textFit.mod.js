define([], function () {

  "use strict";

  return function textFit(els, options) {
    var settings = {
      alignVert: false, // if true, textFit will align vertically using css tables
      alignHoriz: false, // if true, textFit will set text-align: center
      multiLine: false, // if true, textFit will not set white-space: no-wrap
      detectMultiLine: true, // disable to turn off automatic multi-line sensing
      minFontSize: 6,
      maxFontSize: 80,
      reProcess: false, // if true, textFit will re-process already-fit nodes. Leave to 'false' for better performance
      widthOnly: false, // if true, textFit will fit text to element width, regardless of text height
      suppressErrors: false // if true, will not print errors to console
    };

    // Extend options.
    for(var key in options){
      if(options.hasOwnProperty(key)){
        settings[key] = options[key];
      }
    }

    // Convert jQuery objects into arrays
    if (typeof els.toArray === "function") {
      els = els.toArray();
    }

    // Support passing a single el
    var elType = Object.prototype.toString.call(els);
    if (elType !== '[object Array]' && elType !== '[object NodeList]'){
      els = [els];
    }

    for(var i = 0; i < els.length; i++){
      processItem(els[i]);
    }

    function processItem(el){

      if (!isElement(el) || (!settings.reProcess && el.getAttribute('boxfitted'))) {
        return false;
      }

      // Set boxfitted attribute so we know this was processed.
      if(!settings.reProcess){
        el.setAttribute('boxfitted', 1);
      }

      var innerSpan, originalHeight, originalHTML, originalWidth;
      var low, mid, high;

      // Get element data.
      originalHTML = el.innerHTML;
      originalWidth = innerWidth(el);
      originalHeight = innerHeight(el);

      // Don't process if we can't find box dimensions
      if (!originalWidth || (!settings.widthOnly && !originalHeight)) {
        // Show an error, if we can.
        if (window.console && !settings.suppressErrors) {
          if(!settings.widthOnly)
            console.info('Set a static height and width on the target element ' + el.outerHTML +
              ' before using textFit!');
          else
            console.info('Set a static width on the target element ' + el.outerHTML +
              ' before using textFit!');
        }
        return false;
      }

      // Add textfitted span inside this container.
      if (originalHTML.indexOf('textfitted') === -1) {
        innerSpan = document.createElement('span');
        innerSpan.className = 'textfitted';
        innerSpan.innerHTML = originalHTML;
        el.innerHTML = '';
        el.appendChild(innerSpan);
      } else {
        innerSpan = el.querySelector('span.textfitted');
      }

      // Prepare & set alignment
      if (settings.alignVert) {
        el.style['display'] = 'table';
        innerSpan.style['display'] = 'table-cell';
        innerSpan.style['vertical-align'] = 'middle';
      }
      if (settings.alignHoriz) {
        el.style['text-align'] = 'center';
        innerSpan.style['text-align'] = 'center';
      }

      // Check if this string is multiple lines
      // Not guaranteed to always work if you use wonky line-heights
      var multiLine = settings.multiLine;
      if (settings.detectMultiLine && !multiLine &&
          innerSpan.offsetHeight >= parseInt(window.getComputedStyle(innerSpan)['font-size'], 10) * 2){
        multiLine = true;
      }

      // If we're not treating this as a multiline string, don't let it wrap.
      if (!multiLine) {
        el.style['white-space'] = 'nowrap';
      }

      low = settings.minFontSize + 1;
      high = settings.maxFontSize + 1;

      // Binary search for best fit
      while ( low <= high) {
        mid = parseInt((low + high) / 2, 10);
        innerSpan.style.fontSize = mid + 'px';
        if(innerSpan.offsetWidth <= originalWidth && (settings.widthOnly || innerSpan.offsetHeight <= originalHeight)){
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }
      // Sub 1 at the very end, this is closer to what we wanted.
      innerSpan.style.fontSize = (mid - 1) + 'px';
    }

    // Calculate height without padding.
    function innerHeight(el){
      var style = window.getComputedStyle(el, null);
      return el.clientHeight -
        parseInt(style.getPropertyValue('padding-top'), 10) -
        parseInt(style.getPropertyValue('padding-bottom'), 10);
    }

    // Calculate width without padding.
    function innerWidth(el){
      var style = window.getComputedStyle(el, null);
      return el.clientWidth -
        parseInt(style.getPropertyValue('padding-left'), 10) -
        parseInt(style.getPropertyValue('padding-right'), 10);
    }

    //Returns true if it is a DOM element    
    function isElement(o){
      return (
        typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
        o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
      );
    }
  };
})