
const PagesDAO = require("../../dao/pages_dao")
const MatchDAO = require("../../dao/ipl_match_dao")
const franchiseDAO = require("../../dao/ipl_franchise_dao")
const config = require("config")
module.exports = class PagesController {
  static async appHomepage(req, res, next) {
    console.log("At route me...");
    var slug = "home-app"
    const pageFromDB = await PagesDAO.getBcciPage(slug)
    
    if (!pageFromDB) {
      res.send({ status: false, message: "Error!" });
      // errors.general = "Internal error, please try again later"
    }
    else {const empty={};
      for(let i=0;i<=pageFromDB.list.length-1;i++){
        pageFromDB.list[i].contents=pageFromDB.list[i].content_list;
       
        for(let j=0;j<=pageFromDB.list[i].contents.length-1;j++){
          //console.log("content list is: ",pageFromDB.list[i].content_list[j]);
          if(pageFromDB.list[i].contents[j].additionalInfo || Object.keys(pageFromDB.list[i].contents[j]).length===0 ){
            
            pageFromDB.list[i].contents[j].additionalInfo = null;
          }
        }
       
     }
      //processPageData(pageFromDB, req, res, next);
      res.send({ status: true, message: "Received pagedata", pageData: pageFromDB });
    }


  }
  static async webHomepage(req, res, next) {
    console.log("At route me...");
    var slug = "home-web"
    const pageFromDB = await PagesDAO.getBcciPage(slug)
    if (!pageFromDB) {
      res.send({ status: false, message: "Could not load data.", pageData: pageFromDB });
    }
    else {
      for(let i=0;i<=pageFromDB.list.length-1;i++){
        pageFromDB.list[i].contents=pageFromDB.list[i].content_list;
       
     }
      //processPageData(pageFromDB, req, res, next);
      res.send({ status: true, message: "Received pagedata", pageData: pageFromDB });
    }


  }
  static async appVideoLIstpage(req, res, next) {
    console.log("At route me...");
    var slug = "video-list-app"
    const pageFromDB = await PagesDAO.getPage(slug)
    if (!pageFromDB) {
      res.send({ status: false, message: "Error!" });
      // errors.general = "Internal error, please try again later"
    }
    else {
      //processPageData(pageFromDB, req, res, next);
      console.log("In page data here me;;;... ");
      res.send({ status: true, message: "Received pagedata", pageData: pageFromDB });
    }


  }
  static async webVideoLIstpage(req, res, next) {

    var slug = "video-list-web";
    const pageFromDB = await PagesDAO.getPage(slug)
    if (!pageFromDB) {
      res.send({ status: false, message: "Error!" });
      // errors.general = "Internal error, please try again later"
    }
    else {
      //processPageData(pageFromDB, req, res, next);
      console.log("In page data here me;;;... ");
      res.send({ status: true, message: "Received pagedata", pageData: pageFromDB });
    }


  }
  static async appNewsLIstpage(req, res, next) {
    console.log("At route me...");
    var slug = "news-list-app"
    const pageFromDB = await PagesDAO.getPage(slug)
    if (!pageFromDB) {
      res.send({ status: false, message: "Error!" });
      // errors.general = "Internal error, please try again later"
    }
    else {
      //processPageData(pageFromDB, req, res, next);
      console.log("In page data here me;;;... ");
      res.send({ status: true, message: "Received pagedata", pageData: pageFromDB });
    }


  }
  static async webNewsLIstpage(req, res, next) {

    //proccess data
    let page={list:[]}

    //allnews,announcements,matchreport, features nd interviews
    let all = await PagesDAO.getNews("Latest");
               
    if(all && all.length>0){
        let objd = {
            slug:"Latest",name:"Latest News",display_type:"news",contents:all,show_more:true
        }
        page.list.push(objd)
        
    }
    let announcements = await PagesDAO.getNews("announcements");
               
    if(announcements && announcements.length>0){
        let objd = {
            slug:"announcements",name:"Announcements",display_type:"news",contents:announcements,show_more:true
        }
        page.list.push(objd)
        
    }
    let match_reports = await PagesDAO.getNews("match-reports");
               
    if(match_reports && match_reports.length>0){
        let objd = {
            slug:"match-reports",name:"Match Reports",display_type:"news",contents:match_reports,show_more:true
        }
        page.list.push(objd)
        
    }
    let interviews = await PagesDAO.getNews("interviews");
               
    if(interviews && interviews.length>0){
        let objd = {
            slug:"interviews",name:"Interviews",display_type:"news",contents:announcements,show_more:true
        }
        page.list.push(objd)
        
    }
    let cms = await PagesDAO.getNews("pulse-cms");
               
    if(cms && cms.length>0){
        let objd = {
            slug:"more-news",name:"News",display_type:"news",contents:cms,show_more:true
        }
        page.list.push(objd) 
    }
    //var slug = "news-list-web";
    const pageFromDB = page
    //const pageFromDB = await PagesDAO.getPage(slug)
    if (!pageFromDB) {
      res.send({ status: false, message: "Error!" });
      // errors.general = "Internal error, please try again later"
    }
    else {
      //processPageData(pageFromDB, req, res, next);
      console.log("In page data here me;;;... ");
      res.send({ status: true, message: "Received pagedata", pageData: pageFromDB });
    }


  }
  static async webHomeNumbers(req,res,next){
   let wons = await PagesDAO.callWinners();
    console.log("wons: ",wons);
    let runRate = { "netRunRate" : "+1.069",
    "imageurl" : "",
    "slug" : "netrunrate",
    "name" : "Net Run Rate",
    "title" : "Net Run Rate"}

    let runs = await PagesDAO.callHighestRuns("2021")
  //   let runs ={
  //     "runs" : 220,
  //     "imageurl" : "",
  //     "slug" : "runs",
  //     "name" : "Runs",
  //     "title" : "Chennai Super Kings Won By 18 Runs held on Wednesday 21 Apr 2021"}

 }


  static async getapiWebLeaders(req, res, next) {
    try {
        let filters={year:"2021"};
        let innings = [];
        let battings = await MatchDAO.statsBattingData(filters);
        let run = battings.reduce((max, obj) => (max.mostRuns > obj.mostRuns) ? max : obj);    
         run.cap = "RUNS";
        let highScore = battings.reduce((max, obj) => (max.highScore > obj.highScore) ? max : obj);    
        highScore.cap= "SCORE" 
        innings.push(run); innings.push(highScore);
        let bowlings = await MatchDAO.statsBowlingData(filters);
        let wickets = bowlings.reduce((max, obj) => (max.mostWkts > obj.mostWkts) ? max : obj);    
        wickets.cap = "WICKETS"
       
        bowlings = converttoInt(bowlings);
      
        let bestbowlavg = bowlings.reduce((max, obj) => (max.bestBowlAvg1 > obj.bestBowlAvg1) ? max : obj);    
        bestbowlavg.cap = " "
        innings.push(wickets); innings.push(bestbowlavg);
        let resdata=[];

        for(let i=0;i<=innings.length-1;i++){
          let obj ={base:innings[i]};

          let details = await MatchDAO.playerInfoByYear(innings[i].player_id,"2021");
        
         let player = details.matchInfo.teams[0].players.find(element => element.id == innings[i].player_id);
          var team= details.matchInfo.teams[0].team
          if(!player || player == undefined){
            player = details.matchInfo.teams[1].players.find(element => element.id == innings[i].player_id);
            team = details.matchInfo.teams[1].team
          }
       
          let headshots = await MatchDAO.playerHeadshot(innings[i].player_id)
          //console.log("headshots: ", headshots)
          if(headshots)
            player.images = headshots;
          obj.player = player;
          
          let frenchise = await franchiseDAO.getfrenchiseDetails(team.id);
        
            obj.team = frenchise;
            resdata.push(obj)
        
        }

        //processing actual data
        var obj1= {
          title : "Upstox Most Valuable Player",
          player_name : "Harshal Patel",
          first_name : "Harshal",
          last_name : "Patel",
          primaryColor : "#cb0a2b",
          secondaryColor : "#df314f",
          cap : "PTS",
          logo : "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/RCB/Logos/Small/RCB.png",
          logo_medium : "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/RCB/Logos/Medium/RCB.png",
          roundSmall : "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/RCB/Logos/Roundsmall/RCBroundsmall.png",
          roundBig : "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/RCB/Logos/Roundbig/RCBroundbig.png",
          logoOutline : "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/RCB/Logos/Logooutline/RCBoutline.png",
          image_url : "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/playerheadshot/ipl/100x115/157.png",
          image_url_medium :"https://bcciplayerimages.s3.ap-south-1.amazonaws.com/playerheadshot/ipl/210/157.png",
          image_url_large :"https://bcciplayerimages.s3.ap-south-1.amazonaws.com/playerheadshot/ipl/284/157.png",
          image_url_small : "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/playerheadshot/ipl/65x75/157.png",
          digit : "264.5",
          total_runs : 380,
          total_wickets : 0,
          total_matches : 8,
          ipl_debut : 2008,
          specialLine : "HIGHEST SCORE",
          team : "Royal Challengers Bangalore"
         }

         var obj2= {
          title : "Paytm Fairplay",
          player_name : "Sanju Samson",
          first_name : "Sanju",
          last_name : "Samson",
          primaryColor : "#018984",
          secondaryColor : "#00a09a",
          cap : "",
          logo : "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/RR/Logos/Small/RR.png",
          logo_medium : "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/RR/Logos/Medium/RR.png",
          roundSmall : "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/RR/Logos/Roundsmall/RRroundsmall.png",
          roundBig : "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/RR/Logos/Roundbig/RRroundbig.png",
          logoOutline : "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/ipl/RR/Logos/Logooutline/RRoutline.png",
          image_url : "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/playerheadshot/ipl/100x115/258.png",
          image_url_medium: "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/playerheadshot/ipl/210/258.png",
          image_url_large :"https://bcciplayerimages.s3.ap-south-1.amazonaws.com/playerheadshot/ipl/284/258.png",
          image_url_small : "https://bcciplayerimages.s3.ap-south-1.amazonaws.com/playerheadshot/ipl/65x75/258.png",
          digit : "Rajasthan Royals",
          total_runs : 380,
          total_wickets : 0,
          total_matches : 8,
          ipl_debut : 2008,
          specialLine : "HIGHEST SCORE",
          team : "Rajasthan Royals"
         }
        var actData=[];
      
        for(let t=0;t<=resdata.length-1;t++){
          console.log(t)
          let names = resdata[t].player.fullName.split(" ");
          console.log(names);
          let currObj ={};
          currObj.title = resdata[t].base.cap=="RUNS"? "Orange Cap" : resdata[t].base.cap=="SCORE"? "Highest score":resdata[t].base.cap=="WICKETS"?"Purple Cap":"Best Bowling Figures";
          currObj.player_name = resdata[t].player.fullName;
          currObj.first_name =names[0];
          currObj.last_name =names[1];
          currObj.cap=resdata[t].base.cap;
          currObj.primaryColor = resdata[t].base.cap=="RUNS"? "#e3cf23" : resdata[t].base.cap=="SCORE"? "#19398a":resdata[t].base.cap=="WICKETS"?"#9b35f8":"#19398a";
          currObj.secondaryColor = resdata[t].base.cap=="RUNS"? "#ff481e" : resdata[t].base.cap=="SCORE"? "#0d1e49":resdata[t].base.cap=="WICKETS"?"#692f9e":"#0d1e49";
          currObj.logo_medium = resdata[t].team.logo_medium;
          currObj.roundSmall = resdata[t].team.roundSmall;
          currObj.roundBig = resdata[t].team.roundBig;
          currObj.logoOutline = resdata[t].team.logoOutline;
          currObj.image_url = resdata[t].player.images.small;
          currObj.image_url_medium = resdata[t].player.images.meduim;
          currObj.image_url_large = resdata[t].player.images.large;
          currObj.image_url_small = resdata[t].player.images.smaller;
          currObj.digit = resdata[t].base.cap=="RUNS"? resdata[t].base.mostRuns : resdata[t].base.cap=="SCORE"? resdata[t].base.highScore:resdata[t].base.cap=="WICKETS"?resdata[t].base.mostWkts:resdata[t].base.bestBowlAvg;
          currObj.ipl_debut= 2008;
          currObj.specialLine =  resdata[t].base.cap=="RUNS"? "Orange Cap" : resdata[t].base.cap=="SCORE"? "Highest score":resdata[t].base.cap=="WICKETS"?"Purple Cap":"Best Bowling Figures";
          currObj.team = resdata[t].team.name;
         
          actData.push(currObj);
        }
          
        actData.push(obj1); actData.push(obj2)

        res.json({ status: true, data:actData });
    } catch (e) {
        res.status(404).json({ status: false, error: config.error_codes["1003"], data: e })
    }
}

  

}

function converttoInt(bowlings) {
  console.log("in functuon")
    for(bow in bowlings){
      
      if(bowlings[bow].bestBowlAvg =="NA"||bowlings[bow].bestBowlAvg==undefined){
        bowlings[bow].bestBowlAvg1 = 0
      }else{
        bowlings[bow].bestBowlAvg1 = parseFloat(bowlings[bow].bestBowlAvg );
      }
    
    }
    return bowlings;
}
