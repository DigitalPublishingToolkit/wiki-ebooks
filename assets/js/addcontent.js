$(document).ready(function(){

  /* variable declarations */
  var projects = [], //will store the projects - data to be used in the buttons/modules display
      domain,
      page,
      proj,
      reqProject,
      reqPage,
      url,
      req,
      actions = [],
      actionQuery = [],
      queryProps = [],
      actionParse = [],
      parseProps = [],
      queries = [],
      act,
      prop,
      props,
      sub;
  var ready = false;
  var addRandom = false; //random does not use prop

  var wikiAction,
      wikiProj,
      wikiPage,
      wikiProps,
      wikiUrlParse,
      wikiUrlQuery,
      contentModules,
      contentModule,
      contentQuery;
  var queryData, parseData;

  wikiProps = "";
  contentModules = []; //array that will store the saved content
  //titleModules = []; //array that will store the titles (easier to check)

  //localStorage.clear();
  //uncomment to clear localStorage if needed (also possible via the web inspector / Storage tab)


//loops through the datalist and populates the projects array
for(var p=0; p < $('#wikiProjects').children().length; p++){
  //pushes the value to the projects array if it's not there yet
  if( $.inArray($('#wikiProjects').children().eq(p).data('project'), projects) == -1 ){
    //console.log($('#wikiProjects').children().eq(p).data('project') + ' is not in the array.');
    projects.push($('#wikiProjects').children().eq(p).data('project'));
  }
}

function extractDomain(url) {

    //find & remove protocol (http, ftp, etc.) and get domain
    if (url.indexOf("://") > -1) {
        domain = url.split('/')[2];
        page = url.split('/')[4];
        proj = domain.split('.')[1];
        //console.log('proj ' +proj);
    }
    else {
        domain = url.split('/')[0];
        page = url.split('/')[2];
        proj = domain.split('.')[1];
        //console.log('proj ' +proj);
    }

    //find & remove port number
    domain = domain.split(':')[0];
    return [domain, page, proj];

}

function makeQuery(){

  //check selected modules
  if($('.selected').length < 1){
    $('#msg').addClass('error').text('Please select at least one of the modules above.');
    ready = false;

  }else{
    ready = true;

  }

  //alert(ready);
  if(ready){

    alert('Ready! Will make query now!');

    //loop through the arrays and build the strings (one for query, one for parse)

    //actionParse
    if(actionParse.length>0){
      props="&prop=";
    }else{
      props="";
    }
    for(var p=0; p<actionParse.length; p++){
      //console.log('parse ' +actionParse[p]);

      if(p < actionParse.length - 1 ){
        props += actionParse[p]+"|";
      }else{
        props += actionParse[p];
      }

    }

    //add subprops too
    if(parseProps.length>0){
      //console.log(parseProps);
      for(var p=0; p<parseProps.length; p++){
        //console.log('parseProps ' +parseProps[p]);
        props += parseProps[p];
      }
    }

    //console.log(props);
    //check parse length before calling
    if(actionParse.length>0){
      wikiUrlParse = "https://"+domain + "/w/api.php?action=parse&page="+page+props+"&format=json";
      console.log('parse call -> ' +wikiUrlParse);
    }


    //actionQuery (includes 'random' check)
    //if wikipedia, embed contributors, so that's the starting string
    if(proj == "wikipedia"){
      props = "&prop=contributors";
    }

    if(actionQuery.length>0){
      props+="|";
    }else{
      props+="";
    }
    for(var q=0; q<actionQuery.length; q++){
      //console.log('query ' +actionQuery[q]);

      // //add requested modules to contentModules array
      // contentModule = domain + "/" + page + "/" + actionQuery[q];
      // contentModules.push(contentModule);
      if(actionQuery[q]!= 'random'){
        if(q < actionQuery.length - 1 ){
          props += actionQuery[q]+"|";
        }else{
          props += actionQuery[q];
        }
      }


    }
    //add subprops too
    if(queryProps.length>0){
      //console.log(queryProps);
      for(var q=0; q<queryProps.length; q++){
        //console.log('queryProps ' +queryProps[q]);
        props += queryProps[q];
      }
    }

    if(addRandom){
      //adds a string to the query
      props += "&list=random";

      // //adds random to the requested modules
      // contentModules.push('Random page');
    }
    //console.log(props);
    wikiUrlQuery = "https://"+domain + "/w/api.php?action=query&titles="+page+props+"&format=json";
    console.log('query call -> ' +wikiUrlQuery);
    console.log('requested modules -> ' + contentModules);

    //make the calls! (in parallel)
    //check http://stackoverflow.com/questions/19026331/call-multiple-json-data-files-in-one-getjson-request

    $.when(
        $.getJSON(wikiUrlQuery, function(data) {
            queryData = data;
        }),
        $.getJSON(wikiUrlParse, function(data) {
            parseData = data;
        })
    ).then(function() {
        if (queryData) {
            // Worked, put queryData in place
        }
        else {
            // Request for queryData didn't work, handle it
        }
        if (parseData) {
            // Worked, put parseData in place
        }
        else {
            // Request for parseData didn't work, handle it
        }
    });


  }//end if ready

  //.later btns will be visible only after query is back
}

/* events */

//handles the click on the 'Request' button (call to the API)
$('#makeQuery').on('click', function(){
  makeQuery();
});

//handles toggle click modules
$('.module').on('click', function(){

  $(this).toggleClass('selected');
  $('#msg').removeClass('error').text('');
  ready = false;

  //remove or add prop from array
  act = $(this).data('action');
  prop = $(this).data('prop');
  sub = $(this).data('sub');


  if($(this).hasClass('selected')){
    //add the module property to the corresponding action array
    if(act == "query" && actionQuery.indexOf(prop) == -1){
      //random does not use prop but list
      //check https://en.wikipedia.org/w/api.php?action=help&modules=query%2Brandom
      if(prop == 'random'){
        actionQuery.push(prop);
        addRandom = true;
        //adds request to ContentModules array
        contentModule = domain + "/random-page";
        contentModules.push(contentModule);
      }else{
        actionQuery.push(prop);
        //adds request to ContentModules array
        contentModule = domain + "/" + page + "/" + prop;
        contentModules.push(contentModule);
      }



      //get the subproperties
      if(sub){
        console.log('has sub: ' + sub);
        queryProps.push(sub);
      }else{
        console.log('does not have sub');
      }

    }
    if(act == "parse" && actionParse.indexOf(prop) == -1){
      actionParse.push(prop);
      //adds request to ContentModules array
      contentModule = domain + "/" + page + "/" + prop;
      contentModules.push(contentModule);

      //get the subproperties
      if(sub){
        console.log('has sub: '+ sub);
        parseProps.push(sub);
      }else{
        console.log('does not have sub');
      }
    }
  }else{
    //remove the module property from the action array
    if(act == "query" && actionQuery.indexOf(prop) != -1){
      if(prop == 'random'){
        addRandom = false;
        //removes request from ContentModules array
        contentModule = domain + "/random-page";
        console.log('remove random!');
        //contentModules.splice(contentModules.indexOf(contentModule),1);
      }else{
        contentModule = domain + "/" + page + "/" + prop;
      }
      //removes request from ContentModules array
      contentModules.splice(contentModules.indexOf(contentModule),1);

      actionQuery.splice(actionQuery.indexOf(prop),1);
    }
    if(act == "parse" && actionParse.indexOf(prop) != -1){
      //removes request from ContentModules array
      contentModule = domain + "/" + page + "/" + prop;
      contentModules.splice(contentModules.indexOf(contentModule),1);

      actionParse.splice(actionParse.indexOf(prop),1);
    }
  }

  //module description
  // var info = $(this).data('info');
  // $(this).find('.info').text(info);

});

//handles display of modules and buttons based on input content (Project URL and Page)
$( "input[type='text']" ).on("change keyup input paste", function(){

  url = $(this).val();
  req = extractDomain(url);
  //ready = false;

  for(var s=0; s < projects.length; s++){
    if (req[2] == projects[s]){
       reqProject = projects[s];
       reqPage = req[1];
       break;
     }
   }

    //console.log('here ' +reqProject, reqPage);
    //remove all modules
    $('.module').css('display','none');
    //display relevant modules only
    $('.'+reqProject).css('display','inline-block');

  //  console.log('page ' + req[1].length);

    //if all is in place, display buttons
    if(reqProject != undefined && reqPage != undefined){

      if(req[1].length > 0){
        //display buttons
        $('#makeQuery').css('display','inline-block');
      }else{
        $('#makeQuery').css('display','none');
      }

    }

});


  //change handler select (will read/display from corresponding list)
  // $( "#w-action" ).change(function() {
  //
  //   if($(this).val() == "parse"){
  //     var $options = $("#w-parse-prop > option").clone();
  //     $('#w-prop').html($options);
  //   }else if($(this).val() == "query"){
  //     var $options = $("#w-query-prop > option").clone();
  //     $('#w-prop').html($options);
  //   }
  //
  // });

  //check if obj exists in array
  //from http://stackoverflow.com/questions/4587061/how-to-determine-if-object-is-in-array
  // function containsObject(obj, list) {
  //     var i;
  //     for (i = 0; i < list.length; i++) {
  //         if (list[i] === obj) {
  //             return true;
  //         }
  //     }
  //
  //     return false;
  // }

  //will send request on btn click
  // $('#query').click(function(){
  //
  //   //update values before sending
  //   wikiAction = $( "select#w-action option:selected").val();
  //   if(wikiAction == "parse"){
  //     wikiPage = "&page="+$('#w-page').val();
  //   }else{
  //     //query
  //     wikiPage = "&titles="+$('#w-page').val();
  //   }
  //   wikiProj = $('#w-proj').val();
  //
  //   if($('#w-prop').val() != 'null'){
  //     wikiProps = "&prop=";
  //     $.each($('#w-prop').val(), function( index, value ) {
  //       if(index < ( $('#w-prop').val().length - 1) ){
  //         wikiProps += value+"|";
  //       }else{
  //         wikiProps += value;
  //       }
  //     });
  //   }
  //     wikiUrl = wikiProj+"/w/api.php?action="+wikiAction+wikiPage+wikiProps+"&format=json&callback=?";
  //     $('#string').text(wikiUrl);
  //
  //     // will be used to identify contentModules later
  //     contentQuery = wikiProj+"/w/api.php?action="+wikiAction+wikiPage+wikiProps;
  //
  //   //fadeOut the #page container
  //   $('#page').fadeOut("fast", function() {
  //
  //     // fadeOut complete, request data
  //     $.getJSON(wikiUrl, function(data) {
  //
  //
  //             //request complete, do something with the data
  //             //$("#page").html(JSON.stringify(data,undefined,2));
  //             //JSON to HTML
  //             $("#page").html(JSON.stringify(data,undefined,2));
  //
  //             //get an especific object within an object ( in this case change the key you want EX: lang,pageid,url,)
  //             var result = [];
  //             console.log(data);
  //             for(var d in data){
  //               getNames(data);
  //               console.log(d);
  //               console.log(data[d]);
  //               if ("object" == typeof(data[d])) {
  //                 result.push(data[d]);
  //               }
  //             }
  //
  //
  //             document.getElementById("interpretation").innerHTML = ("<h2 style='color: red;'>Result:</h2>" + result.join(", "+("<br>")));
  //             // function getNames(obj, url) {
  //             //     for (var key in obj) {
  //             //         if (obj.hasOwnProperty(key)) {
  //             //             if ("object" == typeof(obj[key])) {
  //             //                 getNames(obj[key],url);
  //             //             } else if (key == url) {
  //             //
  //             //               result.push(obj[key]);
  //             //
  //             //
  //             //             }
  //             //         }
  //             //     }
  //             // }
  //             function getNames(obj) {
  //                 for (var key in obj) {
  //                     if (obj.hasOwnProperty(key)) {
  //                         if ("object" == typeof(obj[key])) {
  //                             getNames(obj[key]);
  //                             result.push(obj[key]);
  //                         } else {
  //                           result.push(obj[key]);
  //                         }
  //                     }
  //                 }
  //             }
  //
  //
  //             //add the contentQuery to the data object (can be useful in the EDIT page)
  //             data[Object.keys(data)[0]]["identifier"] = contentQuery;
  //
  //             //for further info, please check:
  //             // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_Objects
  //
  //              if( containsObject(contentQuery, titleModules) )
  //
  //         {
  //               //true
  //               alert('Content previously selected - will not be saved.')
  //             }else{
  //               //false
  //               contentModules.push(data);
  //               titleModules.push(contentQuery);
  //               //save it locally (MOVE TO ANOTHER BUTTON?)
  //               if (typeof(Storage) !== "undefined") {
  //                   // localStorage supported, go ahead and store
  //                   localStorage["savedContent"]= JSON.stringify(contentModules);
  //               } else {
  //                   // no Web Storage support
  //                   alert('You can\'t save this. Your browser does not support local storage.');
  //               }
  //
  //             }
  //
  //             //display result on this page (currently displaying raw results retrieved from the api query)
  //             $('#page').fadeIn();
  //
  //     });// getJSON end
  //
  //   });// fadeOut end
  //
  // });//#query click end

  //setiFrameUrl();

});// document.ready() end
