var shiftTypeList;
var employees;
var shifts;
Reveal.addEventListener( 'slidechanged', function() {
		 var indices = Reveal.getIndices();
			console.log( "Slide changed: "+indices.f);
			if( !( indices.f === undefined))
				if( indices.f  >= -1)
					plotChart(shifts, indices.f +1);
 			} );
			
Reveal.addEventListener( 'fragmentshown', function() {
		 var indices = Reveal.getIndices();
			console.log( " fragment shown: "+indices.f);
			if( indices.f  >= -1)
			   plotChart(shifts, indices.f+1);
 			} );
Reveal.addEventListener( 'fragmenthidden', function() {
		 var indices = Reveal.getIndices();
			console.log( " fragment h: "+indices.f);
			if( indices.f  >= -1)
			   plotChart(shifts, indices.f+1);
 			} );
d3.json("data/shifts.json", function(error, shiftJson) {
shifts = shiftJson;
	step =0;
  if (error) throw error;
  d3.json("data/employees.json", function(error, jsonemployees) {
  employees = jsonemployees;
    d3.json("data/shiftTypes.json", function(error, jsonShiftTypes) {
	shiftTypeList = jsonShiftTypes
      d3.json("data/constraints.json", function(error, constraintsJson) {
			constraintsJson.forEach(function(step, n){
				rulesObj[n] = {};
				step.forEach( function( rule, i ){
					rule.key = rule.employee+rule.date;
					rule.css =  "label-warning";
					if(rule.level == 0 ){
						rule.css = "label-danger";
					} else if( rule.weight >= -3){
						rule.css = "label-info"
					};
					rulesObj[n][rule.employee+rule.date]=rule;	
				})				
        	})
  });
  });
  });

});

    	var baseDateFormatString = "%Y-%m-%d";
        var format = d3.timeFormat(baseDateFormatString);
        var dateParser = d3.timeParse(baseDateFormatString)
        var week = d3.timeFormat("%W"), // week number of the year
        year = d3.timeFormat("%Y"),
        day = d3.timeFormat("%w"),
        hour = d3.timeFormat("%H");
        
        var columns = ["Monday","Tuesday","Wednesday", "Thursday","Friday","Saturday", "Sunday"];
		var constraintColumns = ["Rule","Employee","Date", "Penalty"];

        var parsedRules;
    	var rulesObj=[];

        var shiftTypes;
        var timeOff;
        var swapping,swapOne;
        var group;
   		var globalStep;
/*
 *       draw the schedule. For now, everthing is just being removed and redrawn instead of being updated
 *
 */		
      	 function plotChart(shifts, index) {  
			if( shifts === undefined) return;
			var steps = shifts.steps;
		    globalStep = index;
     		if( shiftTypeList){
      		 	shiftTypes = shiftTypeObj(shiftTypeList);      	
      		 	group = shiftTypeList[0].schedulingGroup.name;
      	 	}
        	if(!steps[index] ){
        		return;
        	}
        //	parsedRules = rules;
        	var nest = toCalendar( steps[index].assignmentTransfers); 
		    var bootstrapCol =  d3.select("schedule");
			bootstrapCol.select("table").remove();

        	 var table = bootstrapCol.append("table").attr("class","table table-bordered table-fixed"),
             thead = table.append("thead"),
             tbody = table.append("tbody");
        	 
          	 thead.append("tr")
        	        .selectAll("th")
        	        .data(columns)
        	        .enter()
        	        .append("th")
        	            .text(function(column) { return column; });
       	

          	tbody.selectAll("tr")
    	    .data(nest).enter().append("tr");
          	
          	var rows = tbody.selectAll("tr");
    	    // create a cell in each row for each column
          	rows.selectAll("td")
          		.data(function(d) {	
          			return d.values;
          		})
          		.enter().append("td") .html(dateHtml);
          	var cells = rows.selectAll("td");
								
          	var shifts = cells.selectAll("div")
    	    .	data( shiftFilter,
    	    		function(d) {
    	    			return d.date+d.shiftType+d.employeeName;
    	    	});
						
          	var enter = shifts.enter().append("div")
          	.html(shiftHTML)
          	//.style("color","green")
          	.attr("class", ruleClass ).attr("title", ruleTitle );
          	          	
          //	var exit = shifts.exit();
         // 	exit.remove();				
//!!rule class should be changed on both old and new values     	            
          //	 countFilteredShifts(steps[index].assignmentTransfers);
        	  
/* add a table containing the constraints */
			  
			drawConstraints();		 
        }
		
		function drawConstraints(){
		    var bootstrapCol =  d3.select("constraints");
			bootstrapCol.select("table").remove();

			var table = bootstrapCol.append("table").attr("class","table table-bordered table-fixed"),
            thead = table.append("thead");
        	 
          	thead.append("tr")
        	        .selectAll("th")
        	        .data(constraintColumns)
        	        .enter()
        	        .append("th")
        	            .text(function(column) { return column; });
			var tempRules = rulesObj[globalStep];
		
			var sortedValues = d3.entries(tempRules).sort( 										
					function(a,b) {
							var adate = a.value.date, bdate = b.value.date
							if( adate < bdate || bdate == null){
								return -1;
							}else if(adate > bdate || adate == null){
								return 1;
							} 
							return 0;
					} )
          	table.append("tbody")
				.selectAll("tr")
				.data( sortedValues)				
				.enter()
				.append("tr")
				.html(function(row) { 
					return "<td>"+row.value.constraintName+"</td>"
					+"<td>"+row.value.employee+"</td>"
					+"<td>"+row.value.date+"</td>"
					+"<td>"+row.value.weight+"</td>"
					;
				}).attr("class", function(row) { 
					return row.value.css;
				} );

		}
		
        function shiftTypeObj(stypes){
        	var obj = {};
        	stypes.forEach( function (stype){
        		obj[stype.code] = stype;
        	})
        	return obj;
        }
        function dateHtml(d) { 
        	if( d.values )
        		return "<span class = 'date'>"+ d.values[0].date+"</span><hr/>";
        	return "";
        }
        
        function ruleClass(d){
				//if( !showRuleColour) return "";
        	if( d.employeeName != null)
				return ruleLevel(d.employeeName+d.date, globalStep);
        	return "";
        }
        function ruleTitle(d){
    	if( d.employeeName != null)
			return ruleName(d.employeeName+d.date, globalStep);
    	return "";
    }

        function shiftFilter(d){        	
				if(d.values){
				    var filteredShifts = filterShifts(d.values);
					return filteredShifts;	    					
				}
				return "";			
        }
        
       
        function toCalendar( assignments ){
        	var dates = d3.nest()
        	.key(function(d) {  
        		var parse = dateParser(d.date);
        		var val = week(parse)*1+year(parse); 
        		return val;
        	})
            .key(function(d) { return dayFix(dateParser(d.date)); })
            .entries(assignments);
//TODO: this looks crappy and is probably slow, fix.        	
        	for( var key in dates){
        		if( dates[key].values.length < 7){			
        			for (var i = 0; i < 7; i++) { 		
        				var found = false;
        				for( var day =0; day <dates[key].values.length; day++){
        					if( i.toString() == dates[key].values[day].key){
        						found = true;
        						break;						
        					}
        				}
        				if( !found )
        					dates[key].values.splice(i, 0," {key: '"+i.toString()+"', values:[]}");
        			}					
        		}
        	}
        	return dates;
        }
        function dayFix(date){
        	var dayOfWeek = day(date)-1;
        	if( dayOfWeek < 0 ) dayOfWeek = 6;
        	return dayOfWeek;
        }
    	function filterShifts(d){
    		var filtered =  d.filter(function(d){
    			if(  typeof nameFilter === 'undefined') return true;
    			var filters = nameFilter.split(" ");
    			for( var filter in filters){
    				if( shiftText(d.shiftType, d.employeeName).toUpperCase().indexOf(filters[filter].toUpperCase()) > -1 )
    					return true;
    			}
    			return false;
    		});
    		
    		return filtered;
    	}
    	function formatEmployee(employee){
    		if( employee == null){return "*"}
    		return employee.substring(0,11);
    	}
    	function sortAssigments(a, b) {
    		var shiftTypeA = shiftTypes[a.shiftType];
    		var shiftTypeB =  shiftTypes[b.shiftType];
    		return compareShifts(shiftTypeA, shiftTypeB);
    	}
    	
    	function compareShifts(a, b) {
    		var timeStringA=moment(a.startTimeString).format('HHmm');
    		var timeStringB=moment(b.startTimeString).format('HHmm');
    		
    		if (timeStringA < timeStringB) {
    			return -1;
    		}
    		if (timeStringA > timeStringB) {
    			return 1;
    		}
    		
    		return 0;
    	}

    	function shiftHTML( d ){
    		return "<b><small>"+shiftText(d.shiftType, d.employeeName)+"</small></b> <br/>";    		
    	}
    	
    	function shiftText(code, employee){
    		var shiftType = shiftTypes[code];
    		
    		var locationName = shiftType.schedulingGroup.name+" ";
    		if(locationName =="NEURO "){
    			return shiftType.code +" "+ formatEmployee(employee);
    		}
    		if(locationName == "RGH "){locationName="";}
    		return"<font color='black'>"+ zeroFill(shiftType.description,2)+"</font>"+locationName+shiftLabel(code ) +"<font color='green'>"+formatEmployee(employee)+"</font>";
    	}    	    	

    	function shiftLabel( code ){
    		if( code == "FED") return "ED ";
    		if( code == "FM1") return "MT ";
    		if( code == "FM2") return "MT ";
    		if( code == "PM1") return "MT ";
    		if( code == "PM2") return "MT ";
    		if( code == "FC") return "Fx ";
    		if( code == "F1") return " F ";
    		if( code == "F2") return " F ";

    		return "";	
    	}
    	function zeroFill(number, width) {
    		width -= number.toString().length;
    		if (width > 0) {
    			return new Array(width + (/\./.test(number) ? 2 : 1)).join('0')
    					+ number;
    		}
    		return number + ""; // always return a string
    	}
    	function ruleLevel( key, step ){
			if( step >=0 ){
				if( typeof rulesObj[step][key] != 'undefined')
					return rulesObj[step][key].css;
			}
    		return "";
    	}
    	
    	function ruleName( key, step ){
			if( step >=0 ){
				if( typeof rulesObj[step][key] != 'undefined')
					return rulesObj[step][key].constraintName;
			}
    		return "";
        	}
//Shift Counts    	
    	function countFilteredShifts(assignments){
    		
    		var shifts = assignments.filter(function(d){
    			if(  typeof nameFilter === 'undefined') return true;
    			var filters = nameFilter.split(" ");
    			for( var filter in filters){
    				if( formatEmployee(d.employeeName).toUpperCase().indexOf(filters[filter].toUpperCase()) > -1 )
    					return true;
    			}
    			return false;
    		});
    		if( group == "FMC"){
    		var fmcCount = shifts.filter(function(d){
    			if( d.shiftType[0] == "F" ) return true;
    			return false;
    		}).length;
    		
    		var plcCount = shifts.filter(function(d){
    			if( d.shiftType[0] == "P" ) return true;
    			return false;
    		}).length;
    		
    		var nightCount = shifts.filter(function(d){
    			if( d.shiftType == "P12" || d.shiftType == "P13"|| d.shiftType == "F13" || d.shiftType == "F14"){
    				return true;
    			}
    			return false;
    		}).length;
    		var shiftCountText = "FMC:"+fmcCount+"  PLC:"+ plcCount+" N:"+nightCount;
    		var employeeFilter = employees.filter(function(d){
    			if(  typeof nameFilter === 'undefined') return true;
    			var filters = nameFilter.split(" ");
    			for( var filter in filters){
    				if( d.name.toUpperCase().indexOf(filters[filter].toUpperCase()) > -1 )
    					return true;
    			}
    			return false;
    		});
    		if( employeeFilter.length == 1){
    			if(  employeeFilter[0].selfScheduled == 1){
    				d3.select("[id='shiftCount']").text("Self Scheduled");
    			}else{
    			d3.select("[id='shiftCount']").text(employeeFilter[0].fullTimeEquivalent+"% F:"+fmcCount+"("+employeeFilter[0].fmc+"%)  P:"+ plcCount+"("+employeeFilter[0].plc+"%) N:"+nightCount+"("+employeeFilter[0].night+"%)" );	
    			}
    		}
    		else{
    			d3.select("[id='shiftCount']").text("FMC:"+fmcCount+"  PLC:"+ plcCount+" N:"+nightCount );	
    		}
    		
    		}
    		else if(group == "RGH"){
    		var count = shifts.length;				
    		var nightCount = shifts.filter(function(d){
    			if( (d.shiftType == "14" || d.shiftType == "15")) return true;
    			return false;
    		}).length;
    		d3.select("[id='shiftCount']").text("Count="+count +" Nights="+nightCount);
    		}
    		}
