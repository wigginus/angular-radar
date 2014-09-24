(function() {
	'use strict';  angular.module('angular-radar', []).directive('radarChart', function () {
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
				tips:'@'
			},
			link: function (scope, element, attrs) {
				var config = {
					width:scope.width||element[0].parentElement.offsetWidth,
					height:scope.height||element[0].parentElement.offsetHeight,
					chartScale: scope.chartScale || 0.7,
					legendScale: scope.legendScale||0.85,
					levels: scope.levels||3,
					maxValue: scope.maxValue || 0,
					radians: scope.radians||2 * Math.PI,
					rotate: scope.rotate*Math.PI||0 * Math.PI,
					opacityArea: scope.opacityArea||0.6,
					polygonColor: scope.polygonColor || "#OOO",
					circleColor: scope.circleColor || "#555",
					fontSize: scope.fontSize||14,
					tips: scope.tips||"Less than 3 elements"
				};                 

				scope.render = function(data){
					config.size = Math.min(config.width,config.height);
					config.widthShift = (config.size - config.width)/2;
					config.heightShift = (config.size - config.height)/2;
					config.maxValue = Math.max(config.maxValue, d3.max(data, function(i){return d3.max(i.map(function(o){return o.value;}))}));
					var allAxis = (data[0].map(function(i){return i.axis}));
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

					if(total>2){    

						/*Draw Text*/
						var axis = gRadar.selectAll(".axis").data(allAxis).enter().append("g").attr("class", "axis");
						axis.append("text").attr("class", "legend")
							.text(function(d){return d})
							.style("font-family", "Verdana").style("font-size", config.fontSize + "px")
							.style("text-anchor", "middle")        
							.attr("transform", function(d, i){
								var p = getVerticalPosition(i, config.size / 2);
								return p < config.fontSize ? "translate(0, " + (config.fontSize - p) + ")" : "";
							})
							.attr("x", function(d, i){return getHorizontalPosition(i, config.size / 2, config.legendScale);}).attr("transform", "translate(" + (-config.widthShift) + ", " + (-config.heightShift) + ")")
							.attr("y", function(d, i){return getVerticalPosition(i, config.size / 2, config.legendScale);}).attr("transform", "translate(" + (-config.widthShift) + ", " + (-config.heightShift) + ")");
						
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
else{
	gRadar.append("text").attr("class", "legend").text(config.tips)
	.style("font-family", "Verdana").style("font-size", config.fontSize + "px")
	.style("text-anchor", "middle")
	.attr("transform", "translate(" + (config.size/2-config.widthShift) + ", " + (config.size/2-config.heightShift) + ")");
}   
}

scope.$watch('val', function(){
	scope.render(scope.val);
}, true);   

}
};
});
}).call(this);