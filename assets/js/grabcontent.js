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
getNames(data, "lang");
document.getElementById("interpretation").innerHTML = ("result: " + result.join(", "));
function getNames(obj, lang) {
    for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
            if ("object" == typeof(obj[key])) {
                getNames(obj[key], lang);
            } else if (key == lang) {

              result.push(obj[key]);


            }
        }
    }
}
//var jjj = data
//obj = JSON.parse(jjj);

//alert(obj.url);}



              //var validation_messages = data;

            /*  for (var key in data) {
                  // skip loop if the property is from prototype
                  if (!data.hasOwnProperty(key)) continue;

                  var obj = data[key];
                  for (var prop in obj) {
                      // skip loop if the property is from prototype
                      if(!obj.hasOwnProperty(prop)) continue;

                      // your code
                      alert(prop + " = " + obj[prop]);
                  }
              }
*/

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
