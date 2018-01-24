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

		//slider
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


		//tabs
		/*
		function openTab(data, num){
			for( var key in data){
				if( data[key]['visible'] === true ){
					$(data[key]['content']).removeClass('input__content--visible');
					data[key]['visible'] = false;					
				}
				if( key === num ){
					$(data[key]['content']).addClass('input__content--visible');
					data[key]['visible'] = true;
				}
			}
		}

		$('.input__wrapper--tabs').each(function(){
			var wrapper = this;
			wrapper.tabs = {};
			var checked_num = false;
			$(wrapper).find('input[data-tab]').each(function(){
				var num = $(this).attr('data-tab');
				var content = $(wrapper).find('.input__content[data-tab='+num+']').get(0);
				wrapper.tabs[num] = { 
					label: this, 
					content:content, 
					num: num, 
					visible: false 
				};
				if( $(this).prop('checked') ){
					checked_num = num;
				}
				$(this).change(function(){
					openTab(wrapper.tabs, num);
				});				
			});
			if( checked_num ){
				openTab( wrapper.tabs, checked_num );
			}
		});
*/

	});	

})(jQuery);