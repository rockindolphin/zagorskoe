(function($){
	$(document).ready(function() {

		//ширина скроллбара
		var scrollMeasure = $('<div>').addClass('scroll__measure').get(0);
		$('body').append(scrollMeasure);
		var scrollbarWidth = scrollMeasure.offsetWidth - scrollMeasure.clientWidth;
		$(':root').css('--scrollbar-width', scrollbarWidth+'px');
		if( scrollbarWidth > 0 ){
			$('.scroll--cutt').css({
				marginRight: -scrollbarWidth
			});		
		}
		
		//bg
		$('img[data-bg=true]').each(function(){
			var src = $(this).attr('src');
			var parent = $(this).parent();
			if( $(parent).is('picture') ){
				src = $(parent).find('img').get(0).currentSrc;
				parent =  $(parent).parent();
			}
			$(parent).css({
				'background-image': `url(${src})`
			});
			$(this).hide();
		});

		//header
		var headerOpen = false;
		$('#header-menu-toggle').prop('checked',false);
		$('#header-menu-toggle').on('change', function(){
			$('.header__nav').toggleClass('nav--open');
			if( !headerOpen ){
				$('.page__body').addClass('scroll--locked');
			}else{
				$('.page__body').removeClass('scroll--locked');
			}
			headerOpen = !headerOpen;
		});

		$('.header__nav .nav__item>.btn').on('click', function(){
			$(this).closest('.list__item').toggleClass('item--expanded');
		});

		//disable outline on click
		$("body").on("mousedown", "*", function(e) {
			if (($(this).is(":focus") || $(this).is(e.target)) && $(this).css("outline-style") == "none") {
				$(this).css("outline", "none").on("blur", function() {
					$(this).off("blur").css("outline", "");
				});
			}		
		});

		//sliders
		var frontSliderPics = new Swiper('.slider--front-pics .swiper-container', {
			slidesPerView: 1,
			on: {
				slideChange: function(){
					frontSliderText.slideTo( this.activeIndex );
				} 
			}
		});

		var frontSliderText = new Swiper('.slider--front-text .swiper-container', {
			pagination: {
				el: '.swiper-pagination',
				type: 'bullets',
			},
			navigation: {
				nextEl: '.swiper-button-next',
				prevEl: '.swiper-button-prev',
			},
			on: {
				slideChange: function(){
					frontSliderPics.slideTo( this.activeIndex );
				} 		
			}
		});

		var articlesSlider = new Swiper('.slider--articles .swiper-container', {
			slidesPerView: 1,
			spaceBetween: 40,
			pagination: {
				el: '.swiper-pagination',
				type: 'bullets',
				clickable: true,
			},
			navigation: {
				nextEl: '.swiper-button-next',
				prevEl: '.swiper-button-prev',
			},						
			on: {
				init: function(){
					
				} 
			},
			breakpoints: {
				1069: {
					slidesPerView: 2,
				},
				639: {
					slidesPerView: 1,
				},
			}			
		});

		function getSliderHtml(slider, slides){
			var html = 
`<div class="slider slider--blog-gallery-${slider}">
	<div class="swiper-container">
		<div class="swiper-wrapper">
			${slides}
		</div>
	</div>
</div>`;
			return html;
		}

		var blogGallery = new Swiper('.gallery--blog .swiper-container', {
			slidesPerView: 'auto',
			thumbsSlider: null,
			navigation: {
				nextEl: '.swiper-button-next',
				prevEl: '.swiper-button-prev',
			},						
			on: {
				init: function(){
					var main = this;
					var thumbs_html = '';
					var caption_html = '';
					[].slice.call(this.slides).map(function(slide){
						var src = $(slide).find('img').attr('src');
						var caption = $(slide).find('.slide__caption').get(0);
						thumbs_html+= `<div class="swiper-slide" style="background-image:url(${src})"></div>`;
						caption_html+= `<div class="swiper-slide">${ $(caption).html() || '' }</div>`;
						$(caption).remove();
					});

					//thumbs
					var thumbsSliderNode = $(getSliderHtml('thumbs',thumbs_html));
					$(this.el).parent().after( thumbsSliderNode );
					this.params.thumbsSlider = new Swiper( $(thumbsSliderNode).find('.swiper-container').get(0),{
						spaceBetween: 10,
						slidesPerView: 'auto',
						slideToClickedSlide: true,
						centeredSlides: true
					});
					this.params.thumbsSlider.controller.control = this;
					this.controller.control = this.params.thumbsSlider;

					//caption
					var captionSliderNode = $(getSliderHtml('caption',caption_html));
					$(thumbsSliderNode).after( captionSliderNode );
					this.params.captionSlider = new Swiper( $(captionSliderNode).find('.swiper-container').get(0),{
						slidesPerView: 'auto',
						allowTouchMove: false,
					});

				}, 
				slideChange: function(){
					this.params.captionSlider.slideTo(this.activeIndex);
				}			
			},
		});				


	});	

})(jQuery);