(function ($) {
	var $window = $(window),
		$body = $('body'),
		settings = {

			// Carousels
			carousels: {
				speed: 4,
				fadeIn: true,
				fadeDelay: 250
			},

		};

	// Breakpoints.
	breakpoints({
		wide: ['1281px', '1680px'],
		normal: ['961px', '1280px'],
		narrow: ['841px', '960px'],
		narrower: ['737px', '840px'],
		mobile: [null, '736px']
	});

	$(document).ready(function () {
		function inputSearch() {
			var link = "";
			$('#search-submit').click(function (event) {
				event.preventDefault();
				var queryString = $('#search-input').val();
				//Make sure this location matches your site structure
				var location = "/sites/positions/_layouts/15/osssearchresults.aspx?u=" + 
					encodeURIComponent(_spPageContextInfo.siteAbsoluteUrl).replace(/[.]/g, "%2E") +"&k="+ queryString;
				link = location;
				$('#search-input').attr("value", '');
				window.location.href = link;
				return;
			});
			if (location.href.toLocaleLowerCase().indexOf('/news.aspx') > 0 ){
				var ua = window.navigator.userAgent;
				var msie = ua.indexOf("MSIE ");
				//Is IE
				if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)){
					var  a = document.getElementById('MSOZoneCell_WebPartWPQ2');
					a.parentElement.classList.remove("ms-webpart-zone");
					a.parentElement.classList.remove("ms-fullWidth");

					a.classList.remove("s4-wpcell-plain");
					a.classList.remove("ms-webpartzone-cell");
					a.classList.remove("ms-webpart-cell-vertical-inline-table");
					a.classList.remove("ms-webpart-cell-vertical");
                    a.classList.remove("ms-fullWidth");
                    
                    a.style.paddingTop = '10px';
                    a.children[0].classList.remove("ms-webpart-chrome-vertical");
                    
				} else {
				var  a = document.getElementById('MSOZoneCell_WebPartWPQ2');
					a.parentElement.classList = [];
					a.classList  = [];
				}
			}
			if (location.href.toLocaleLowerCase().indexOf('/articles') == -1){
				if($('.ms-rtestate-field > img').length > 0 ){
                    var ua = window.navigator.userAgent;
                    var msie = ua.indexOf("MSIE ");
                    //Is IE
                    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)){
                        var url = $('.ms-rtestate-field > img')[0].href;
                        if(url){
                            $('#header').css('background-image', 'url("'+url+'")');
                            $('#header').css('background-position' ,'center center');
                        }
                    } else {
                        var url = $('.ms-rtestate-field > img')[0].currentSrc;
                        if(url){
                            $('#header').css('background-image', 'url("'+url+'")');
                            $('#header').css('background-position' ,'center center');
                        }
                    }
				}
			}
		}

		inputSearch();



		$('#search-input').keypress(function (key) {
			if ($(this).is(":focus") && (key.which == 13)) {
				$('#search-submit').click();
			}
		});
	});

	// Play initial animations on page load.
	$window.on('load', function () {
		window.setTimeout(function () {
			$body.removeClass('is-preload');
			setCarousel();
			setAccordian();
			ExecuteOrDelayUntilScriptLoaded(function () {
				IsCurrentUserMemberOfGroup('Restricted Access Viewers', function (userInGroup) {
					if(location.href.toLocaleLowerCase().indexOf('/articles') == -1){
						if (userInGroup) {
							var ua = window.navigator.userAgent;
							var msie = ua.indexOf("MSIE ");
							//Is IE
							if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)){
								setTimeout(function(){
									$('.restricted-access').show();
								},500);
							}
							else {
								$('.restricted-access').show();
							}
						}
					}
				});
			}, 'SP.js');
		}, 100);
	});

	// Dropdowns.
	$('#nav > ul').dropotron({
		mode: 'fade',
		speed: 350,
		noOpenerFade: true,
		alignment: 'center'
	});

	// Scrolly.
	$('.scrolly').scrolly();

	// Nav.

	// Button.
	$('<div id="navButton">' +
		'<a href="#navPanel" class="toggle"></a>' +
		'</div>').appendTo($body);

	// Panel.
	$(
			'<div id="navPanel">' +
			'<nav>' +
			$('#nav').navList() +
			'</nav>' +
			'</div>'
		)
		.appendTo($body)
		.panel({
			delay: 500,
			hideOnClick: true,
			hideOnSwipe: true,
			resetScroll: true,
			resetForms: true,
			target: $body,
			visibleClass: 'navPanel-visible'
		});

	function setAccordian() {
		var acc = document.getElementsByClassName("accordion");
		var i;

		for (i = 0; i < acc.length; i++) {
			acc[i].addEventListener("click", function () {
				this.classList.toggle("active");
				var panel = this.nextElementSibling;
				if (panel.style.maxHeight) {
					panel.style.maxHeight = null;
				} else {
					panel.style.maxHeight = panel.scrollHeight + "px";
				}
			});
		}
	}

	function setCarousel() {
		$('.carousel').each(function () {

			var $t = $(this),
				$forward = $('<span class="forward"></span>'),
				$backward = $('<span class="backward"></span>'),
				$reel = $t.find('.reel'),
				$items = $reel.find('article');

			var pos = 0,
				leftLimit,
				rightLimit,
				itemWidth,
				reelWidth,
				timerId;

			// Items.
			if (settings.carousels.fadeIn) {

				//$items.addClass('loading');

				$t.scrollex({
					mode: 'middle',
					top: '-20vh',
					bottom: '-20vh',
					enter: function () {

						var timerId,
							limit = $items.length - Math.ceil($window.width() / itemWidth);

						timerId = window.setInterval(function () {
							var x = $items.filter('.loading'),
								xf = x.first();

							if (x.length <= limit) {

								window.clearInterval(timerId);
								$items.removeClass('loading');
								return;

							}

							xf.removeClass('loading');

						}, settings.carousels.fadeDelay);

					}
				});

			}

			// Main.
			$t._update = function () {
				pos = 0;
				rightLimit = (-1 * reelWidth) + $window.width();
				leftLimit = 0;
				$t._updatePos();
			};

			$t._updatePos = function () {
				$reel.css('transform', 'translate(' + pos + 'px, 0)');
			};
				// Forward.
				$forward
					.appendTo($t)
					.hide()
					.mouseenter(function (e) {
						timerId = window.setInterval(function () {
							pos -= settings.carousels.speed;

							if (pos <= rightLimit) {
								window.clearInterval(timerId);
								pos = rightLimit;
							}

							$t._updatePos();
						}, 10);
					})
					.mouseleave(function (e) {
						window.clearInterval(timerId);
					});

				// Backward.
				$backward
					.appendTo($t)
					.hide()
					.mouseenter(function (e) {
						timerId = window.setInterval(function () {
							pos += settings.carousels.speed;

							if (pos >= leftLimit) {

								window.clearInterval(timerId);
								pos = leftLimit;

							}

							$t._updatePos();
						}, 10);
					})
					.mouseleave(function (e) {
						window.clearInterval(timerId);
					});

			reelWidth = $reel[0].scrollWidth;

			if (browser.mobile) {
				$reel
				.css('overflow-y', 'hidden')
				.css('overflow-x', 'scroll')
				.scrollLeft(0);

				document.getElementsByClassName('carousel')[0].style = 'overflow : auto !important';				
				$forward.hide();
				$backward.hide();

			} else {

				$reel
					.css('overflow', 'visible')
					.scrollLeft(0);
				$forward.show();
				$backward.show();

			}

			$t._update();

			$window.on('resize', function () {
				reelWidth = $reel[0].scrollWidth;
				$t._update();
			}).trigger('resize');
		});
	}


	function IsCurrentUserMemberOfGroup(groupName, OnComplete) {

		var currentContext = new SP.ClientContext.get_current();
		var currentWeb = currentContext.get_web();

		var currentUser = currentContext.get_web().get_currentUser();
		currentContext.load(currentUser);

		var allGroups = currentWeb.get_siteGroups();
		currentContext.load(allGroups);

		var group = allGroups.getByName(groupName);
		currentContext.load(group);

		var groupUsers = group.get_users();
		currentContext.load(groupUsers);

		currentContext.executeQueryAsync(OnSuccess, OnFailure);

		function OnSuccess(sender, args) {
			var userInGroup = false;
			var groupUserEnumerator = groupUsers.getEnumerator();
			while (groupUserEnumerator.moveNext()) {
				var groupUser = groupUserEnumerator.get_current();
				if (groupUser.get_id() == currentUser.get_id()) {
					userInGroup = true;
					break;
				}
			}
			OnComplete(userInGroup);
		}

		function OnFailure(sender, args) {
			OnComplete(false);
		}
	}


})(jQuery);