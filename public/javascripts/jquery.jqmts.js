/*
 * jquery.jqmts
 * https://github.com/commadelimited/jQuery-Mobile-Tiny-Sort
 * Version: 0.5.1
 *
 * Copyright (c) 2014 andy matthews
 * Licensed under the MIT license.
 */
(function($, window) {

	"use strict";

    function getOrder(str) {
        if (str.indexOf('desc')===0) {
            return 'desc';
        } else {
            return 'asc';
        }
    }

    function getData(str) {
        if (str.indexOf('desc')===0) {
            return str.substring(4);
        } else if (str.indexOf('asc')===0) {
            return str.substring(3);
        } else {
            return str;
        }
    }

	var defaults = {
		useNativeMenu: false,
		attributes: {},
		showCounts: true,
		className: 'jqmts'
	},
	buildMenu = function($el, options) {
		// build out the select menu
		var $select = $('<div class="list-group-item form-inline"></div>').addClass(options.className)
            .prepend($('<div class="form-group"></div>')
                .prepend(
            $('<select class="form-control"></select>')
							// .data('native-menu',options.useNativeMenu)
							.attr(
								{
									'id': $el.attr('id') + '-sort',
									'name': $el.attr('id') + '-sort',
									'data-native-menu': options.useNativeMenu
								}
							)
							.html(function(){
								var str = [];
								for (var o in options.attributes) {
									str.push('<option value="asc' + o + '">' + options.attributes[o] + ' (Ascending)</option>');
                                    str.push('<option value="desc' + o + '">' + options.attributes[o] + ' (Descending)</option>');
								}
								return str.join('');
							}).on('change', function(e){
								$('.m-sortable',$el).tsort({data: 'sort-' + getData(e.currentTarget.value), order: getOrder(e.currentTarget.value)});
							})
						).prepend($('<span> &nbsp; &nbsp; &nbsp;</span>'))
                .prepend('<input id="m-select-all" type="checkbox" onclick="m$.toggleSelectAll();"/>'))
            ;
		// insert it
		$el.prepend( $select ).trigger('create');
	},
	compileKeys = function($el, options) {
		var $list = $('li:not(.' + options.className + ')',$el);
		var $dropdown = $('#' + $el.attr('id') + '-sort');
		var scope = window;

		// populate counts for the sort dropdown
		$list.each(function(i,el){
			var $li = $(this);
			for (var d in $li.data()) {

				// make sure that the sortKeys variable exists
				if (typeof scope.sortKeys == "undefined") scope.sortKeys = {};

				// we only want items prepended with "sort"
				if (d.indexOf('sort') >= 0) {
					// make sure the item doesn't already exist
					if (!scope[d]) {
						// if it doesn't, then create it
						scope[d] = {};
						// then populate it
						scope.sortKeys[d] = d;
					}
					// then populate it
					scope[d][$li.data(d)] = $li.data(d);
				}
			}
		});

		// if there are no stream items then sortKeys is undefined
		if (typeof scope.sortKeys != "undefined") {
			var addHeader = function(i,old){
					var value = $(this).val();
					return old + ' (' + Object.keys(scope[s]).length + ')';
				};
			for(var s in scope.sortKeys) {
				var prep = s.toLowerCase().replace('sort','');
				$('option[value=' + prep + ']',$dropdown).text(addHeader);
			}
			$dropdown.selectmenu('refresh');
		}
	},
	methods = {
		init: function(options) {
			// enforce hard dependancy on TinySort
			if (typeof window.jQuery.tinysort != 'object') {
				window.alert('TinySort is not defined.\nhttp://tinysort.sjeiti.com/');
				return;
			}
			this.data("jqmts", $.extend({}, defaults, options));
			buildMenu(this,this.data("jqmts"));
			if (options.showCounts) compileKeys(this,this.data("jqmts"));
			return this;
		},
		destroy: function(){
			// remove header row
			$(this).find('.' + defaults.className).remove();
		}
	};

	$.fn.jqmts = function(method) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return methods.init.apply(this, arguments);
		}
	};
})(jQuery, window);