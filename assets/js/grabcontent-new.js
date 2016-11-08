$(document).ready(function(){

//handles toggle click modules
$('.module').on('click', function(){
  $(this).toggleClass('selected');
  // var info = $(this).data('info');
  // $(this).find('.info').text(info);
});

//will store the projects - data to be used in the buttons/modules display
var projects = [];

//loops through the datalist and populates the projects array
for(var p=0; p < $('#wikiProjects').children().length; p++){
  //pushes the value to the projects array if it's not there yet
  if( $.inArray($('#wikiProjects').children().eq(p).data('project'), projects) == -1 ){
    //console.log($('#wikiProjects').children().eq(p).data('project') + ' is not in the array.');
    projects.push($('#wikiProjects').children().eq(p).data('project'));
  }
}

//.later btns will be visible only after query is back

$( "input[type='text']" ).on("change keyup input paste", function(){

    var val = $(this).val();
    var proj = $('#wikiProjects option').filter(function() {
      return this.value == val;
    }).data('project');
    var project;
   //check string agains projects inside the projects array
   for(var s=0; s < projects.length; s++){
    //  if ($(this).val() == projects[s]){
    if (proj == projects[s]){
       //console.log(projects[s]);
       project = projects[s];
       break;
     }
   }
    //console.log($(this).val());
    //console.log($(this).data('project'));
    console.log(project);
    //remove all modules
    $('.module').css('display','none');
    //display relevant modules only
    $('.'+project).css('display','inline-block');
    //display modules
});

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
