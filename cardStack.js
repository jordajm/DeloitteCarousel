(function($) {
  
    var App = {

        csConfig: undefined,
        csCarousel: undefined,
        cardCount: undefined,
        currentCard: undefined,
        maxWidth: undefined,
        minWidth: undefined,
        autoplay: undefined,
        autoplayTimeout: undefined,
        border: undefined,
        autoStartMedia: [],
        csOptions: {
            // loop:true,
            nav:true,
            autoHeight:true,
            items: 1,
            autoplay: undefined,
            autoplayTimeout: undefined,
            autoplayHoverPause: true,
        },
 
    /**
    * Init Function
    */
    init: function() {
        App.getConfig();
    },

    getConfig: function() {
        $.get('https://dl.dropboxusercontent.com/u/213392662/DUPressCarousel/localmotors-part1.json', function(data){ 
        }).success(function(data) {
            App.csConfig = JSON.parse(data);
            console.log(App.csConfig);
            App.parseConfig(App.csConfig);
        }).fail(function() {
            console.log('There was an error loading Config data for the Card Stack widget');
        });
    },

    parseConfig: function(config) {
        if(config.config.autoNavigation == 'true'){
            App.csOptions.autoplay = true;
            if(config.config.autoNavInterval){
                App.csOptions.autoplayTimeout = parseInt(config.config.autoNavInterval);
            }else{
                App.csOptions.autoplayTimeout = 5000;
            }
        }else{
            App.csOptions.autoplay = false;
        }

        if(config.maxWidth && config.maxWidth != '750px'){
            App.maxWidth = config.maxWidth;
        }

        if(config.minWidth && config.minWidth != '440px'){
            App.minWidth = config.minWidth;
        }

        if(config.border && config.border != 'none'){
            App.border = config.border;
        }

        var contentItems = config.contentItems;
        var contentLength = config.contentItems.length;
        for(var i = 0; i < contentLength; i++){
            var thisItem = contentItems[i];
            var itemHTML;
            if(thisItem.imageURL){
                if(thisItem.captionTextToggle && thisItem.captionTextToggle == 'true'){
                    if(thisItem.audioURL){
                        // Image + Caption + Audio
                        itemHTML = '<div class="cs-card-content" style="background-image:url(' + thisItem.imageURL + ')"><div class="cs-caption"><p class="caption-text" style="color:' + thisItem.captionTextColor + ';background-color:' + thisItem.captionBackgroundColor + ';font-family:' + thisItem.captionTextFont + ';font-size:' + thisItem.captionTextSize + ';' + thisItem.captionPosition + ':0px">' + thisItem.captionContent + '</p></div><iframe class="audio-iframe" src="' + thisItem.audioURL + '" frameborder="0" allowfullscreen></iframe></div>';
                    }else{
                        // Image + Caption
                        itemHTML = '<div class="cs-card-content" style="background-image:url(' + thisItem.imageURL + ')"><div class="cs-caption"><p class="caption-text" style="color:' + thisItem.captionTextColor + ';background-color:' + thisItem.captionBackgroundColor + ';font-family:' + thisItem.captionTextFont + ';font-size:' + thisItem.captionTextSize + ';' + thisItem.captionPosition + ':0px">' + thisItem.captionContent + '</p></div></div>';
                    }
                }else{
                    if(thisItem.audioURL){
                        // Image + Audio
                        itemHTML = '<div class="cs-card-content" style="background-image:url(' + thisItem.imageURL + ')"><iframe style="border: none" src="' + thisItem.audioURL + '" height="100" width="640" scrolling="no"></iframe></div>';
                    }else{
                        // Image Only
                        itemHTML = '<div class="cs-card-content" style="background-image:url(' + thisItem.imageURL + ')"></div>';
                    }
                }
            }
            if(thisItem.audioURL && !thisItem.imageURL){
                // Audio
                itemHTML = '<div class="cs-card-content"><iframe src="' + thisItem.audioURL + '" frameborder="0" allowfullscreen></iframe></div>';
            }
            if(thisItem.videoURL){
                // Video
                itemHTML = '<div class="cs-card-content"><div class="cs-embed-container"><iframe src="' + thisItem.videoURL + '" frameborder="0" allowfullscreen></iframe></div></div>';
            }

            // Should this item be played automatically when it comes into view? - Create an array that can be looped through each time the carousel changes selected item
            if(thisItem.autoStartMedia && thisItem.autoStartMedia == 'true'){
                App.autoStartMedia.push('true');
            }else{
                App.autoStartMedia.push('false');
            }

            $('.cs-carousel').append(itemHTML);
        }

        App.renderCsCarousel();
    },

    renderCsCarousel: function() {
        App.csCarousel = $('.cs-carousel').owlCarousel(App.csOptions);

        $('.cs-prev-btn').click(function(){
            App.csCarousel.trigger('prev.owl.carousel')
        });

        $('.cs-next-btn').click(function(){
            App.csCarousel.trigger('next.owl.carousel')
        });

        App.csCarousel.on('changed.owl.carousel', function() {
            setTimeout(function(){
                App.getCurrentCardIndex();
            },0);
        });

        setTimeout(function(){
            App.countCards();
            App.getCurrentCardIndex();
            App.setHeightOnRender();
        },0);

    },

    countCards: function() {
        App.cardCount = $('.cs-card-content').length;
    },

    getCurrentCardIndex: function() {
        App.currentCard = $('.owl-stage').find('.active').closest('.owl-item').index() + 1;
        App.addDisabledStates();
    },

    addDisabledStates: function() {
        if(App.currentCard == 1){
            $('.owl-prev').fadeOut('slow');
        }else{
            $('.owl-prev').fadeIn('slow');
        }

        if(App.currentCard == App.cardCount){
            $('.owl-next').fadeOut('slow');
        }else{
            $('.owl-next').fadeIn('slow');
        }
    },

    setHeightOnRender: function() {

        App.setContentHeight();

        $( window ).resize(function() {
            App.setContentHeight();
        });

        var stageWidth = ($(window).width() * $('.cs-card-content').length);
        $('.owl-stage').css('width', stageWidth);
        $('.owl-item').css('width', $(window).width());

    },

    setContentHeight: function() {
        var windowWidth = $(window).width();
        var windowHeight = $(window).height();
        if(windowHeight > (windowWidth * .57)){
            $('.cs-card-content').css('height', windowWidth * .57);
        }else{
            $('.cs-card-content').css({'height': windowHeight, 'width': (windowHeight / .57)});
            $('.owl-next').css('left', (windowHeight / .57) - 125);
        }
    }

}

    $(function() {
        App.init();
    });


})(jQuery);