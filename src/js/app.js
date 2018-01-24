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
			}
		});		


	});	

})(jQuery);