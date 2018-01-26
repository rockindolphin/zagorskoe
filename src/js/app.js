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
			},
			navigation: {
				nextEl: '.swiper-button-next',
				prevEl: '.swiper-button-prev',
			},						
			on: {
				init: function(){
					//console.log('ok');
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

		var blogGallery = new Swiper('.gallery--blog .swiper-container', {
			slidesPerView: 'auto',
			thumbsSlider: null,
			navigation: {
				nextEl: '.swiper-button-next',
				prevEl: '.swiper-button-prev',
			},						
			on: {
				init: function(){
					var slides_html = '';
					[].slice.call(this.slides).map(function(slide){
						var src = $(slide).find('img').attr('src');
						slides_html+= `<div class="swiper-slide" style="background-image:url(${src})"></div>`;
					});
					var thumbs_slider_html = 
`<div class="slider slider--blog-gallery-thumbs">
	<div class="swiper-container gallery-thumbs">
	    <div class="swiper-wrapper">
			${slides_html}
		</div>
	</div>
</div>`;
					var thumbsSliderNode = $(thumbs_slider_html);
					var main = this;
					$(this.el).parent().after( thumbsSliderNode );
					this.params.thumbsSlider = new Swiper( $(thumbsSliderNode).find('.swiper-container').get(0),{
						spaceBetween: 10,
						slidesPerView: 'auto',
						slideToClickedSlide: true,
						centeredSlides: true
					});
					this.params.thumbsSlider.controller.control = this;
					this.controller.control = this.params.thumbsSlider;						
				} 
			},			
		});				


	});	

})(jQuery);