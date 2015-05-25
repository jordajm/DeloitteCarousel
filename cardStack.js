$(document).ready(function() {

    var csConfig,
        csCarousel,
        cardCount,
        currentCard,
        maxWidth,
        minWidth,
        autoplay = false,
        autoplayTimeout = 5000,
        border,
        autoStartMedia = [],
        csOptions = {
            // loop:true,
            nav:true,
            autoHeight:true,
            items: 1,
            autoplay: autoplay,
            autoplayTimeout: autoplayTimeout,
            autoplayHoverPause: true,
        };

    $.get('https://dl.dropboxusercontent.com/u/213392662/DUPressCarousel/config.json', function(data){ 
    }).success(function(data) {
        csConfig = JSON.parse(data);
        console.log(csConfig);
        parseConfig();
    }).fail(function() {
        console.log('There was an error loading Config data for the Card Stack widget');
    });

    function parseConfig() {

        if(csConfig.navigation == 'Auto' || csConfig.navigation == 'Auto And Manual'){
            autoplay = true;
            if(csConfig.autoNavInterval){
                autoplayTimeout = csConfig.autoNavInterval;
            }
        }

        if(csConfig.maxWidth && csConfig.maxWidth != '750px'){
            maxWidth = csConfig.maxWidth;
        }

        if(csConfig.minWidth && csConfig.minWidth != '440px'){
            minWidth = csConfig.minWidth;
        }

        if(csConfig.border && csConfig.border != 'none'){
            border = csConfig.border;
        }

        var contentItems = csConfig.contentItems;
        var contentLength = csConfig.contentItems.length;
        for(var i = 0; i < contentLength; i++){
            var thisItem = contentItems[i];
            var itemHTML;
            if(thisItem.imageURL){
                if(thisItem.captionTextToggle && thisItem.captionTextToggle == 'true'){
                    if(thisItem.audioiFrame){
                        // Image + Caption + Audio
                        itemHTML = '<div class="cs-card-content" style="background-image:url(' + thisItem.imageURL + ')"><div class="cs-caption"><p class="caption-text" style="color:' + thisItem.captionTextColor + ';background-color:' + thisItem.captionBackgroundColor + ';font-family:' + thisItem.captionTextFont + ';font-size:' + thisItem.captionFontSize + ';' + thisItem.captionPosition + ':0px">' + thisItem.captionContent + '</p></div>' + thisItem.audioiFrame + '</div>';
                    }else{
                        // Image + Caption
                        itemHTML = '<div class="cs-card-content" style="background-image:url(' + thisItem.imageURL + ')"><div class="cs-caption"><p class="caption-text" style="color:' + thisItem.captionTextColor + ';background-color:' + thisItem.captionBackgroundColor + ';font-family:' + thisItem.captionTextFont + ';font-size:' + thisItem.captionFontSize + ';' + thisItem.captionPosition + ':0px">' + thisItem.captionContent + '</p></div></div>';
                    }
                }else{
                    if(thisItem.audioiFrame){
                        // Image + Audio
                        itemHTML = '<div class="cs-card-content" style="background-image:url(' + thisItem.imageURL + ')">' + thisItem.audioURL + '</div>';
                    }else{
                        // Image Only
                        itemHTML = '<div class="cs-card-content" style="background-image:url(' + thisItem.imageURL + ')"></div>';
                    }
                }
            }
            if(thisItem.videoURL){
                // Video
                itemHTML = '<div class="cs-card-content"><div class="cs-embed-container"><iframe src="' + thisItem.videoURL + '" frameborder="0" allowfullscreen></iframe></div></div>';
            }
            if(thisItem.audioiFrame){
                // Audio
                itemHTML = '<div class="cs-card-content"><iframe src="' + thisItem.audioURL + '" frameborder="0" allowfullscreen></iframe></div>';
            }
            // Should this item be played automatically when it comes into view? - Create an array that can be looped through each time the carousel changes selected item
            if(thisItem.autoStartMedia && thisItem.autoStartMedia == 'true'){
                autoStartMedia.push('true');
            }else{
                autoStartMedia.push('false');
            }

            $('.cs-carousel').append(itemHTML);
        }

        renderCsCarousel();

    }

    function renderCsCarousel() {
        csCarousel = $('.cs-carousel').owlCarousel(csOptions);

        $('.cs-prev-btn').click(function(){
            csCarousel.trigger('prev.owl.carousel')
        });

        $('.cs-next-btn').click(function(){
            csCarousel.trigger('next.owl.carousel')
        });

        csCarousel.on('changed.owl.carousel', function() {
            setTimeout(function(){
                getCurrentCardIndex();
            },0);
        });

        (function countCards() {
            cardCount = $('.cs-card-content').length;
            $('.total-card-count').html(cardCount);
        })();

        function getCurrentCardIndex() {
            currentCard = $('.owl-stage').find('.active').closest('.owl-item').index() + 1;
            $('.current-card-index').html(currentCard);
            addDisabledStates();
        };
        getCurrentCardIndex();

        function addDisabledStates() {
            if(currentCard == 1){
                $('.owl-prev').fadeOut('slow');
            }else{
                $('.owl-prev').fadeIn('slow');
            }

            if(currentCard == cardCount){
                $('.owl-next').fadeOut('slow');
            }else{
                $('.owl-next').fadeIn('slow');
            }
        }

    }; // Closing renderCsCarousel()

    function resizeCardStack() {
        var csWindowHeight = $(window).height();
        if(csWindowHeight < 500){
            $('.cs-body').css('height', csWindowHeight);
            $('.cs-container').css('height', (csWindowHeight - 40));
        }
    }
    resizeCardStack();

    $(window).resize(function(){
        resizeCardStack();
    });

}); 