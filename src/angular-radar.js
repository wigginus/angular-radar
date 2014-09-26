(function() {
	'use strict';  angular.module('angular-radar', ['ngAnimate']).directive('radarChart', ['$animate', function ($animate) {
		return {
			restrict: 'E', 
			scope: { 
				maxValue:'=',
				val: '=',
				width:'=',
				height:'=',
				levels: '=',
				rotate: '=',
				chartScale: '=',
				legendScale: '=',
				polygonColor: '=',
				circleColor: '=',
				radians:'=',
				opacityArea:'=',
				fontSize:'=',
				drawBubbles:'=',
				tips:'@'
			},
			link: function (scope, element, attrs) {
				var config = {
					width:scope.width||element[0].parentElement.offsetWidth,
					height:scope.height||element[0].parentElement.offsetHeight,
					chartScale: scope.chartScale || 0.6,
					legendScale: scope.legendScale||0.8,
					levels: scope.levels||3,
					maxValue: scope.maxValue || 0,
					radians: scope.radians||2 * Math.PI,
					rotate: scope.rotate*Math.PI||0 * Math.PI,
					opacityArea: scope.opacityArea||0.6,
					polygonColor: scope.polygonColor || "#OOO",
					circleColor: scope.circleColor || "#555",
					fontSize: scope.fontSize||14,
					drawBubbles: scope.drawBubbles || false,
					tips: scope.tips||"Less than 3 elements"
				};    

				var init = false;             

				scope.render = function(data){

					config.size = Math.min(config.width,config.height);
					config.widthShift = (config.size - config.width)/2;
					config.heightShift = (config.size - config.height)/2;
					config.maxValue = Math.max(config.maxValue, d3.max(data, function(i){return d3.max(i.map(function(o){return o.value;}))}));
					var allAxis = (data[0].map(function(i){return i.axis}));
					var allImages = (data[0].map(function(i){return i.imgUrl}));
					var allChanged = (data[0].map(function(i){return {"axis": i.axis, "changed": i.changed}}));
					var total = (data[0].map(function(i){return i.value})).length;
					var radius = config.chartScale*config.size/2;
					function getPosition(i, range, chartScale, func){
						return range * (1 - chartScale * func(i * config.radians / total+config.rotate));
					}
					function getHorizontalPosition(i, range, chartScale){               
						return getPosition(i, range, chartScale, Math.sin);
					}
					function getVerticalPosition(i, range, chartScale){                     
						return getPosition(i, range, chartScale, Math.cos);
					}              

					d3.select(element[0]).select("svg").remove();
					var gRadar = d3.select(element[0]).append("svg").attr("width", config.width).attr("height", config.height).append("g");       

					gRadar.append("circle")
						.attr("cx", config.width / 2)
						.attr("cy", config.height / 2)
						.attr("r", config.size / 2.5)
						.attr("class", "radar-chart-circle")
						;

						if (config.drawBubbles){
							// draw orange bubbles around icons
							var iconHeight = 100;

							var imgCirclesContainer = gRadar
							.selectAll("imgBubble")
							.data(allChanged)
							.enter()
							.append("g")
							.attr("class", function(d, i){return "radar-image-bubble radar-image-bubble-"+d.axis.split(" ")[0]});

							var imgCirclesOutest = imgCirclesContainer
							.append("circle")
							.attr("class", "radar-image-bubble-outest")
							.attr("cx", function(d, i){return getHorizontalPosition(i, config.size/2.3, config.legendScale);})
							.attr("cy", function(d, i){return getVerticalPosition(i, config.size/2.3, config.legendScale);})
							.attr("r", iconHeight / 2 + 30)
							.attr("transform", "translate(" + (iconHeight / 2) + ", " + (iconHeight / 2) + ")")
							;

							var imgCirclesOuter = imgCirclesContainer
							.append("circle")
							.attr("class", "radar-image-bubble-outer")
							.attr("cx", function(d, i){return getHorizontalPosition(i, config.size/2.3, config.legendScale);})
							.attr("cy", function(d, i){return getVerticalPosition(i, config.size/2.3, config.legendScale);})
							.attr("r", iconHeight / 2 + 20)
							.attr("transform", "translate(" + (iconHeight / 2) + ", " + (iconHeight / 2) + ")")
							;

							var imgCircles = imgCirclesContainer
							.append("circle")
							.attr("class", "radar-image-bubble-inner")
							.attr("cx", function(d, i){return getHorizontalPosition(i, config.size/2.3, config.legendScale);})
							.attr("cy", function(d, i){return getVerticalPosition(i, config.size/2.3, config.legendScale);})
							.attr("r", iconHeight / 2 + 10)
							.attr("transform", "translate(" + (iconHeight / 2) + ", " + (iconHeight / 2) + ")")
							;

							// draw white circle around icons
							var iconHeight = 100;
							var imgCircles = gRadar.selectAll("imgCircle").data(allImages).enter()
							.append("g")
							.append("circle")
							.attr("class", "radar-image-circle")
							.attr("cx", function(d, i){return getHorizontalPosition(i, config.size/2.3, config.legendScale);})
							.attr("cy", function(d, i){return getVerticalPosition(i, config.size/2.3, config.legendScale);})
							.attr("r", iconHeight / 2)
							.attr("transform", "translate(" + (iconHeight / 2) + ", " + (iconHeight / 2) + ")")
							;
		
							/* Draw Icons */
							var imgs = gRadar.selectAll("image").data(allImages).enter()
							.append("g")
							.append("svg:image")
							.attr("class", "radar-image")
							.attr("xlink:href", function(d){return d})
							.attr("width", iconHeight)
							.attr("height", iconHeight)
							.attr("x", function(d, i){return getHorizontalPosition(i, config.size/2.3, config.legendScale);})
							.attr("y", function(d, i){return getVerticalPosition(i, config.size/2.3, config.legendScale);})
							//.attr("transform", "translate(" + (config.widthShift) + ", " config.heightShift) + ")")
							;
						}
												

						/*Draw Area*/
						var series = 0;    
						data.forEach(function(element, index){
							var dataValues = [];
							element.forEach(function(element, index){
								dataValues.push([
									getHorizontalPosition(index, config.size/2, (parseFloat(Math.max(element.value, 0.1))/config.maxValue)*config.chartScale),
									getVerticalPosition(index, config.size/2, (parseFloat(Math.max(element.value, 0.1))/config.maxValue)*config.chartScale)
									]);
							});

							var polygon = gRadar.selectAll(".area")
							.data([dataValues])
							.enter()
							.append("polygon")
							.attr("class", "radar-chart-polygon")
							.attr("points",function(d) {
								var str="";
								for(var pti=0;pti<d.length;pti++){
									str=str+d[pti][0]+","+d[pti][1]+" ";
								}
								return str;
							})
							.style("fill-opacity", config.opacityArea)
							.attr("transform", "translate(" + (-config.widthShift) + ", " + (-config.heightShift) + ")")
							;
							series++;
						}); 

						/*Draw Outer Line*/
						for(var j=0; j<config.levels; j++){
							//var levelFactor = radius*((j+1)/config.levels);
							var drawBasic = gRadar.selectAll(".levels").data(allAxis).enter().append("svg:line")
							.attr("x1", function(d, i){return getHorizontalPosition(i, config.size/2, config.chartScale);})
							.attr("y1", function(d, i){return getVerticalPosition(i, config.size/2, config.chartScale);})
							.attr("x2", config.width / 2)
							.attr("y2", config.height / 2);
							drawBasic.attr("class", "radar-chart-line")
							.style("stroke-width", 1.5)
							.attr("transform", "translate(" + (-config.widthShift) + ", " + (-config.heightShift) + ")");  
						}

}

scope.update = function(data){
		config.size = Math.min(config.width,config.height);
		config.widthShift = (config.size - config.width)/2;
		config.heightShift = (config.size - config.height)/2;
		config.maxValue = Math.max(config.maxValue, d3.max(data, function(i){return d3.max(i.map(function(o){return o.value;}))}));
		var allAxis = (data[0].map(function(i){return i.axis}));
		var allImages = (data[0].map(function(i){return i.imgUrl}));
		var allChanged = (data[0].map(function(i){return {"axis": i.axis, "changed": i.changed}}));
		var total = (data[0].map(function(i){return i.value})).length;
		var radius = config.chartScale*config.size/2;
		function getPosition(i, range, chartScale, func){
			return range * (1 - chartScale * func(i * config.radians / total+config.rotate));
		}
		function getHorizontalPosition(i, range, chartScale){               
			return getPosition(i, range, chartScale, Math.sin);
		}
		function getVerticalPosition(i, range, chartScale){                     
			return getPosition(i, range, chartScale, Math.cos);
		}  


		var gRadar = d3.select(element[0]).select("svg").select("g");
		gRadar.select("polygon").remove();

		var changedCategory = allChanged.filter(function(r){return r.changed})[0];

		var bubbleUp = angular.element(".radar-image-bubble-"+changedCategory.axis.split(" ")[0]);
		angular.element(".radar-image-bubble-"+changedCategory.axis.split(" ")[0])
			.bind("animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd", function(){ 
			$animate.removeClass(bubbleUp, 'radar-image-bubble-shown');
		});

		$animate.addClass(bubbleUp, 'radar-image-bubble-shown');

		var series = 0;    
		data.forEach(function(element, index){
			var dataValues = [];
			element.forEach(function(element, index){
				dataValues.push([
					getHorizontalPosition(index, config.size/2, (parseFloat(Math.max(element.value, 0.1))/config.maxValue)*config.chartScale),
					getVerticalPosition(index, config.size/2, (parseFloat(Math.max(element.value, 0.1))/config.maxValue)*config.chartScale)
					]);
			});

			var polygon = gRadar.selectAll(".area")
			.data([dataValues])
			.enter()
			.append("polygon")
			.attr("class", "radar-chart-polygon")
			.attr("points",function(d) {
				var str="";
				for(var pti=0;pti<d.length;pti++){
					str=str+d[pti][0]+","+d[pti][1]+" ";
				}
				return str;
			})
			.style("fill-opacity", config.opacityArea)
			.attr("transform", "translate(" + (-config.widthShift) + ", " + (-config.heightShift) + ")")
			;
			series++;
		}); 
}

scope.$watch('val', function(){
	if (!init){
		scope.render(scope.val);
		init = true;
	} else {
		scope.update(scope.val);
	}
	
}, true);   

}
};
}]);
}).call(this);