;(function(){
	//初始化数据
	/*{
		2014: {
			3: [],
			2: []
		},
		2013: {
			3: [],
			2: []
		}
	}*/
	var formatData = {},
		year = [],
		month = [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];
	
	for(var i = 0; i < data.length; i++){
		var date = new Date(data[i].date);
		
		var y = date.getFullYear(),
			m = date.getMonth() + 1,
			d = date.getDate(),
			lunar = GetLunarDateString(date);
		
		year.push(y);
		
		if(!formatData[y])	formatData[y] = {};
		if(!formatData[y][m])	formatData[y][m] = [];
		
		var like = data[i].like,
			formatLike = like / 10000 > 1 ? (like / 10000).toFixed(1) + '万' : like;
		
		formatData[y][m].push({
			'year': y,
			'month': m,
			'day': d,
			'lunar': lunar,
			'date': data[i].date,
			'intro': data[i].intro,
			'comment': data[i].comment,
			'like': like,
			'formatLike': formatLike,
			'media': data[i].media
		});
	}
	
	//去重复函数
	Array.prototype.distance = function(){
		for(var i = 0; i < this.length; i++){
			if(this[i + 1]){
				if(this[i] === this[i + 1]){
					this.splice(i + 1, 1);
					i--;
				}
			}
		}
		return this;
	}
	
	year.distance().sort(function(a, b){
		return b - a;
	});
	
	var scrubberYear = [];
	
	var scrubberYearHtml = $('#tpl-s-year').html().trim(),
		scrubberMonthHtml = $('#tpl-s-month').html().trim(),
		cYearHtml = $('#tpl-c-year').html().trim(),
		cClearHtml = $('#tpl-c-clear').html().trim(),
		cItemHtml = $('#tpl-c-item').html().trim(),
		cContent = '';

	for(var i = 0; i < year.length; i++){
		
		var scrubberMonth = [];
		var content = [];
		
		for(var j = 0; j < month.length; j++){
			
			if( formatData[year[i]][month[j]] ){
				var arr = formatData[year[i]][month[j]];
				
				arr.sort(function(a, b){
					return b.day - a.day;
				});

				scrubberMonth.push( scrubberMonthHtml.replace(/\{year\}/g, year[i]).replace(/\{month\}/g, month[j]) );
				var cItem = [];
				
				for(var k = 0; k < arr.length; k++){
					
					cItem.push( cItemHtml.replace(/\{first\}/g, k === 0 ? 'c-item-first' : '')
										 .replace(/\{pos\}/g, k % 2 ? 'c-item-right' : 'c-item-left')
										 .replace(/\{lunar\}/g, arr[k].lunar)
									     .replace(/\{date\}/g, arr[k].date)
									     .replace(/\{intro\}/g, arr[k].intro)
									     .replace(/\{zan\}/g, arr[k].like)
									     .replace(/\{pin\}/g, arr[k].comment)
									     .replace(/\{like\}/g, arr[k].formatLike + '人觉得很赞') );
				}
				
				content.push( cClearHtml.replace(/\{year\}/g, year[i]).replace(/\{month\}/g, month[j]) + cItem.join('') );
			}
			
		}
		cContent += cYearHtml.replace(/\{year\}/g, year[i]).replace(/\{list\}/g, content.join(''));
		scrubberYear.push( scrubberYearHtml.replace(/\{year\}/g, year[i]).replace(/\{list\}/g, scrubberMonth.join('')) );		
	}

	$('#scrubber').append(scrubberYear.join('')).prepend('<a href="javascript:;" class="s-year" id="s-year-0">现在</a>');
	$('#content').html(cContent);
	
	//展开时序
	function expandScrubber(year, elem){
		var $scrubber = $('#scrubber');

		$scrubber.find('.s-year').removeClass('cur'),
		$scrubber.find('.s-month').removeClass('cur').hide();

		if(!year){
			year = new Date().getFullYear();
		}

		if(!elem){			
			elem = '#s-year-' + year;
		}		
		
		$(elem).addClass('cur');
		
		$scrubber.find('.s-month-' + year).show();
	}
	
	expandScrubber('2017');
	
	//月份高亮处理
	function hightMonth(year, month){
		$('#scrubber').find('.s-month').removeClass('cur');
		$('#s-month-' + year + month).addClass('cur');
	}
	
	var navHeight = $('#top-nav').height();//每次移动需要减去nav的高度
	
	//年份点击处理
	function showYear(year, elem){
		expandScrubber(year, elem);
		
		var top = 0;
		
		if(year === '现在'){
			top = 0;
		}else{
			top = $('#c-year-' + year).offset().top - navHeight;
		}
		
		$('html, body').animate({
			'scrollTop': top
		}, 500, 'linear');
	}
	
	//月份点击处理
	function showMonth(year, month, elem){
		hightMonth(year, month);
		var top = $('#c-month-' + year + month).offset().top - navHeight;
		$('html, body').animate({
			'scrollTop': top
		}, 500, 'linear');
	}
	
	$('#scrubber').delegate('a', 'click', function(){
		var $this = $(this);
		
		if($this.hasClass('s-year')){
			showYear( $this.html(), $this );
		}else if($this.hasClass('s-month')){
			showMonth($this.data('year'), $this.data('month'), $this);
		}
	});
	
	var scrubberTop = $('#scrubber').offset().top - navHeight;
	var itemHeight = [];
	
	$('#content').find('.c-item-left').each(function(){
		itemHeight.push( $(this).offset().top - navHeight );
	});
	
	$(window).scroll(function(){
		var $scrubber = $('#scrubber');
		var scrollTop = $('html, body').scrollTop();

		var l = ( $(this).width() - $('#container').width() ) / 2;
		
		if(scrollTop > scrubberTop){
			$scrubber.css({
				'position': 'fixed',
				'top': 50,
				'left': l
			});
		}else{
			$scrubber.css({
				'position': 'absolute',
				'top': 29,
				'left': 0
			});
		}
		
		if(!scrollTop){
			expandScrubber('0');
			return;
		}
		
		$.each(itemHeight, function(i, item) {
			if(scrollTop - 200 < item){
				var $el = $('#content').find('.c-item-left').eq(i);
				
				var prev = $el.prevUntil('#content', '.c-clear');
				
				var year = prev.data('year'),
					month = prev.data('month');
				
				expandScrubber(year);
				hightMonth(year, month);
				return false;
			}
		});

	});
})(jQuery);
