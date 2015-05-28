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
        audioSnippets: [],
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
                    if(thisItem.podcastURL){
                        // Image + Caption + Podcast
                        itemHTML = '<div class="cs-card-content" style="background-image:url(' + thisItem.imageURL + ')"><div class="cs-caption" style="' + thisItem.captionPosition + ':0px;background-color:' + thisItem.captionBackgroundColor + '"><p class="cs-caption-text" style="color:' + thisItem.captionTextColor + ';font-family:' + thisItem.captionTextFont + ';font-size:' + thisItem.captionTextSize + ';text-align:' + thisItem.captionTextAlign + '">' + thisItem.captionContent + '</p></div><iframe style="border:none;width:75%;position:absolute;bottom:0;left:12.5%" src="' + thisItem.podcastURL + '" height="100" width="640" scrolling="no"></iframe></div>';
                    }else if(thisItem.audioSnippetURL){
                        // Image + Caption + Audio Snippet which plays when slide comes into view
                        itemHTML = '<div class="cs-card-content" style="background-image:url(' + thisItem.imageURL + ')"><div class="cs-caption" style="' + thisItem.captionPosition + ':0px;background-color:' + thisItem.captionBackgroundColor + '"><p class="cs-caption-text" style="color:' + thisItem.captionTextColor + ';font-family:' + thisItem.captionTextFont + ';font-size:' + thisItem.captionTextSize + ';text-align:' + thisItem.captionTextAlign + '">' + thisItem.captionContent + '</p></div></div>';
                        App.audioSnippets.push({slideNum: (i + 1), url: thisItem.audioSnippetURL});
                    }else{
                        // Image + Caption
                        itemHTML = '<div class="cs-card-content" style="background-image:url(' + thisItem.imageURL + ')"><div class="cs-caption" style="' + thisItem.captionPosition + ':0px;background-color:' + thisItem.captionBackgroundColor + '"><p class="cs-caption-text" style="color:' + thisItem.captionTextColor + ';font-family:' + thisItem.captionTextFont + ';font-size:' + thisItem.captionTextSize + ';text-align:' + thisItem.captionTextAlign + '">' + thisItem.captionContent + '</p></div></div>';
                    }
                }else{
                    if(thisItem.podcastURL){
                        // Image + Podcast
                        itemHTML = '<div class="cs-card-content" style="background-image:url(' + thisItem.imageURL + ')"><iframe style="border:none;width:75%;position:absolute;bottom:0;left:12.5%" src="' + thisItem.podcastURL + '" height="100" width="640" scrolling="no"></iframe></div>';
                    }else if(thisItem.audioSnippetURL){
                        // Image + Audio Snippet which plays when slide comes into view
                        itemHTML = '<div class="cs-card-content" style="background-image:url(' + thisItem.imageURL + ')"></div>';
                        App.audioSnippets.push({slideNum: (i + 1), url: thisItem.audioSnippetURL});
                    }else{
                        // Image Only
                        itemHTML = '<div class="cs-card-content" style="background-image:url(' + thisItem.imageURL + ')"></div>';
                    }
                }
            }
            if(thisItem.audioURL && !thisItem.imageURL){
                // Podcast only - no image or caption
                itemHTML = '<div class="cs-card-content"><iframe style="border:none;width:75%;position:absolute;bottom:0;left:12.5%" src="' + thisItem.podcastURL + '" height="100" width="640" scrolling="no"></iframe></div>';
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

    checkForAudioSnippets: function() {
        var snippets = App.audioSnippets;
        if(!snippets) return;

        $('.cs-snippet').remove();

        var snippetsLen = snippets.length;
        for(var i = 0; i < snippetsLen; i++){
            var thisSnippet = snippets[i];
            if(thisSnippet.slideNum == App.currentCard){
                var iframe = '<iframe class="audio-iframe cs-snippet" style="display:none" src="' + thisSnippet.url + '" frameborder="0" allowfullscreen></iframe>';
                $('.cs-card-content:eq(' + (App.currentCard - 1) + ')').append(iframe);
            }
        }
    },

    countCards: function() {
        App.cardCount = $('.cs-card-content').length;
    },

    getCurrentCardIndex: function() {
        App.currentCard = $('.owl-stage').find('.active').closest('.owl-item').index() + 1;
        App.checkForAudioSnippets();
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
        if(windowHeight > (windowWidth * .5625)){
            $('.cs-card-content').css('height', windowWidth * .5625);
        }else{
            $('.cs-card-content').css({'height': windowHeight, 'width': (windowHeight / .5625)});
            $('.owl-next').css('left', (windowHeight / .5625) - 90);
        }
    }

}

    $(function() {
        App.init();
    });


})(jQuery);