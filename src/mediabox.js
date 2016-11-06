(function (root, factory) {
    "use strict";
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.MediaBox = factory();
    }
}(this, function () {
    "use strict";

    var MediaBox = function (element) {
        if (!this || !(this instanceof MediaBox)) {
            return new MediaBox(element);
        }

        if (!element) {
            return false;
        }

        this.selector = element instanceof NodeList ? element : document.querySelectorAll(element);
        this.root     = document.querySelector('body');
        this.run();
    };

    MediaBox.prototype = {
        run: function () {
            Array.prototype.forEach.call(this.selector, function (el) {
                el.addEventListener('click', function (e) {
                    e.preventDefault();

                    var link = this.parseUrl(el.getAttribute('href'));
                    this.render(link);
                    this.events();
                }.bind(this), false);
            }.bind(this));

            this.root.addEventListener('keyup', function (e) {
                if ((e.keyCode || e.which) === 27) {
                    this.close(this.root.querySelector('.mediabox-wrap'));
                }
            }.bind(this), false);
        },
        template: function (s, d) {
            var p;

            for (p in d) {
                if (d.hasOwnProperty(p)) {
                    s = s.replace(new RegExp('{' + p + '}', 'g'), d[p]);
                }
            }
            return s;
        },
        parseUrl: function (url) {
            var service = {},
                matches;

            if (matches = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/)) {
                service.provider = "youtube";
                service.id       = matches[2];
            } else if (matches = url.match(/https?:\/\/(?:www\.)?vimeo.com\/(?:channels\/|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/)) {
                service.provider = "vimeo";
                service.id       = matches[3];
            } else {
                service.provider = "html5";
                service.id       = url;
                //service.id       = '12345';
            }

            return service;
        },
        render: function (service) {
            var embedLink,
                lightbox;

            if (service.provider === 'youtube') {
                embedLink = 'https://www.youtube.com/embed/' + service.id;
            } else if (service.provider === 'vimeo') {
                embedLink = 'https://player.vimeo.com/video/' + service.id;
            } else {
                embedLink = service.id ;
                //throw new Error("Invalid video URL");
            }
            
            if (service.provider === 'youtube' || service.provider === 'vimeo' ) {
                
            lightbox = this.template(
                '<div class="mediabox-wrap" role="dialog" aria-hidden="false"><div class="mediabox-content" role="document" tabindex="0"><span class="mediabox-close" aria-label="close"></span><iframe src="{embed}?autoplay=1" frameborder="0" allowfullscreen></iframe></div></div>', {
                    embed: embedLink
                });

            } else {
                
                // LOADING GIF EXAMPLES
                // http://rmhc.org.sg/wp-content/uploads/tvc/vidloading.gif
                // https://s-media-cache-ak0.pinimg.com/originals/4f/43/2d/4f432d9234988a5f33b26e0ba06bc6fe.gif
                // https://s18.postimg.org/gr6zd940p/loading2.gif
                // https://s14.postimg.org/si566pj5d/image.gif
                // https://s4.postimg.org/xklx83wnh/loading3.gif
                
                var ext = embedLink.split('.').pop();
                ext = removeParam(ext);
                if (!ext) ext = "mp4";
                
            lightbox = this.template(
                '<div class="mediabox-wrap" role="dialog" aria-hidden="false"><div class="mediabox-content" role="document" tabindex="0"><span class="mediabox-close" aria-label="close"></span><video style="background-color:#000000" controls autoplay width="100%" height="100%" poster="https://s14.postimg.org/si566pj5d/image.gif"><source src="{embed}" type="video/'+ext+'">Your browser does not support the video tag.</video></div></div>', {
                    embed: embedLink
                });
                
            }
                

            this.root.insertAdjacentHTML('beforeend', lightbox);
        },
        events: function () {
            var wrapper = document.querySelector('.mediabox-wrap');
             
            /* GC */
            setTimeout(function(){  
                wrapper.setAttribute("id", "mediabox-show");
            }, 0);
            
            /*GC from close mediabox-content */
            wrapper.addEventListener('click', function (e) {
                if (e.target && e.target.nodeName === 'SPAN' && e.target.className === 'mediabox-close' || e.target.nodeName === 'DIV' && e.target.className === 'mediabox-wrap' || e.target.nodeName === 'DIV' && e.target.className === 'mediabox-content') {
                    this.close(wrapper);
                }
            }.bind(this), false);
        },
        close: function (el) {
            if (el === null) return true;
            var timer = null;

            if (timer) {
                clearTimeout(timer);
            }

            //el.classList.add('mediabox-hide');
            el.removeAttribute('id');

            timer = setTimeout(function() {
                var el = document.querySelector('.mediabox-wrap');
                if (el !== null) {
                    this.root.removeChild(el);
                }
            }.bind(this), 500);
        }
    };

    return MediaBox;
}));


// Remove param
function removeParam(url) {
    var value = url.substring(url.lastIndexOf('/') + 1);
    //get the part after before ?
    value = value.split("?")[0];
    return value;
}
