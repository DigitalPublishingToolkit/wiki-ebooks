$(document).ready(function(){



  var wikiAction,
      wikiProj,
      wikiPage,
      wikiProps,
      wikiUrl,
      contentModules,
      contentQuery;

  wikiProps = "";
  contentModules = []; //array that will store the saved content (as objects)
  titleModules = []; //array that will store the titles (easier to check)

  //localStorage.clear();
  //uncomment to clear localStorage if needed (also possible via the web inspector / Storage tab)

  //change handler select (will read/display from corresponding list)
  $( "#w-action" ).change(function() {

    if($(this).val() == "parse"){
      var $options = $("#w-parse-prop > option").clone();
      $('#w-prop').html($options);
    }else if($(this).val() == "query"){
      var $options = $("#w-query-prop > option").clone();
      $('#w-prop').html($options);
    }

  });

  //check if obj exists in array
  //from http://stackoverflow.com/questions/4587061/how-to-determine-if-object-is-in-array
  function containsObject(obj, list) {
      var i;
      for (i = 0; i < list.length; i++) {
          if (list[i] === obj) {
              return true;
          }
      }

      return false;
  }

  //will send request on btn click
  $('#query').click(function(){

    //update values before sending
    wikiAction = $( "select#w-action option:selected").val();
    if(wikiAction == "parse"){
      wikiPage = "&page="+$('#w-page').val();
    }else{
      //query
      wikiPage = "&titles="+$('#w-page').val();
    }
    wikiProj = $('#w-proj').val();

    if($('#w-prop').val() != 'null'){
      wikiProps = "&prop=";
      $.each($('#w-prop').val(), function( index, value ) {
        if(index < ( $('#w-prop').val().length - 1) ){
          wikiProps += value+"|";
        }else{
          wikiProps += value;
        }
      });
    }
      wikiUrl = wikiProj+"/w/api.php?action="+wikiAction+wikiPage+wikiProps+"&format=json&callback=?";
      $('#string').text(wikiUrl);

      // will be used to identify contentModules later
      contentQuery = wikiProj+"/w/api.php?action="+wikiAction+wikiPage+wikiProps;

    //fadeOut the #page container
    $('#page').fadeOut("fast", function() {

      // fadeOut complete, request data
      $.getJSON(wikiUrl, function(data) {


              //request complete, do something with the data
              //$("#page").html(JSON.stringify(data,undefined,2));
              //JSON to HTML
              $("#page").html(JSON.stringify(data,undefined,2));

              //get an especific object within an object ( in this case change the key you want EX: lang,pageid,url,)
              var result = [];
              console.log(data);
              for(var d in data){
                getNames(data);
                console.log(d);
                console.log(data[d]);
                if ("object" == typeof(data[d])) {
                  result.push(data[d]);
                }
              }


              document.getElementById("interpretation").innerHTML = ("<h2 style='color: red;'>Result:</h2>" + result.join(", "+("<br>")));
              // function getNames(obj, url) {
              //     for (var key in obj) {
              //         if (obj.hasOwnProperty(key)) {
              //             if ("object" == typeof(obj[key])) {
              //                 getNames(obj[key],url);
              //             } else if (key == url) {
              //
              //               result.push(obj[key]);
              //
              //
              //             }
              //         }
              //     }
              // }
              function getNames(obj) {
                  for (var key in obj) {
                      if (obj.hasOwnProperty(key)) {
                          if ("object" == typeof(obj[key])) {
                              getNames(obj[key]);
                              result.push(obj[key]);
                          } else {
                            result.push(obj[key]);
                          }
                      }
                  }
              }


              //var validation_messages = data;

            //  for (var key in data) {
            //       // skip loop if the property is from prototype
            //       if (!data.hasOwnProperty(key)) continue;
             //
            //       var obj = data[key];
            //       for (var prop in obj) {
            //           // skip loop if the property is from prototype
            //           if(!obj.hasOwnProperty(prop)) continue;
             //
            //           // your code
            //           console.log("pushing " +prop + " = " + obj[prop] + " to result.");
            //           result.push([prop, obj[prop]]);
            //       }
            //   }
            //   console.log(result);

              //another loop, now through the new array result
              // var outputResult;
              // for(var r=0; r<result.length; r++){
              //   if(result[r][1] == '[object Object]'){
              //     alert(r);
              //     var myObj = result[r][1];
              //     for (var myProp in myObj) {
              //         if(!myObj.hasOwnProperty(myProp)) continue;
              //
              //         console.log("myObj " +myProp + " = " + myObj[myProp] );
              //         outputResult += myProp + ': ' + myObj[myProp]+'<br>';
              //     }
              //   }
              //   console.log('r is ' + r);
              //   console.log('item in result array ' +result[r]);
              //   console.log('item 1 of ' + r + result[r][0]);
              //   console.log('item 2 of ' + r + result[r][1]);
              //   outputResult += result[r][0]+':'+result[r][1]+'<br>';
              // }
              // document.getElementById("interpretation").innerHTML = '<h2>RESULTS</h2><p>'+outputResult+'</p>';


              //add the contentQuery to the data object (can be useful in the EDIT page)
              data[Object.keys(data)[0]]["identifier"] = contentQuery;

              //for further info, please check:
              // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects

               if( containsObject(contentQuery, titleModules) )

          {
                //true
                alert('Content previously selected - will not be saved.')
              }else{
                //false
                contentModules.push(data);
                titleModules.push(contentQuery);
                //save it locally (MOVE TO ANOTHER BUTTON?)
                if (typeof(Storage) !== "undefined") {
                    // localStorage supported, go ahead and store
                    localStorage["savedContent"]= JSON.stringify(contentModules);
                } else {
                    // no Web Storage support
                    alert('You can\'t save this. Your browser does not support local storage.');
                }

              }

              //display result on this page (currently displaying raw results retrieved from the api query)
              $('#page').fadeIn();

      });// getJSON end

    });// fadeOut end

  });//#query click end

});// document.ready() end
