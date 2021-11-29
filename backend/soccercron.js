const cron = require('node-cron');
const dateFormat = require('date-format');
const {leagueSchemaModel} = require("./models/leagueModel");
const {matchSchemaModel} = require("./models/matchModel");
const {oddsLogSchemaModel} = require("./models/oddsLogModel");
const {sportsAxios} = require("./brokersportsaxios");

let cronTask, oddsCalcTask, refreshMatchesTask;
const oddsTimeLine = [
  { ah_key: "ah_odds24h", ou_key: "ou_odds24h", timeLine: -86400000 },
  { ah_key: "ah_odds8h", ou_key: "ou_odds24h", timeLine: -28800000 },
  { ah_key: "ah_odds4h", ou_key: "ou_odds24h", timeLine: -14400000 },
  { ah_key: "ah_odds2h", ou_key: "ou_odds24h", timeLine: -7200000 },
  { ah_key: "ah_odds30m", ou_key: "ou_odds24h", timeLine: -1800000 },
]

const createCronJob = () => {

  // cronTask = cron.schedule('* * * * *', function() {
  //   console.log('running a task every minute', dateFormat('yyyy.MM.dd hh:mm:ss.SSS', new Date()));
  // });

  refreshMatchesTask = cron.schedule('59 23 * * *', async function() {
    console.log('running a task every day 23:59', dateFormat('yyyy.MM.dd hh:mm:ss.SSS', new Date()));
    const leagues = await leagueSchemaModel.find();
    // console.log(leagues);
    for (let i = 0; i < leagues.length; i++) {
      const league = leagues[i];
      const response = await sportsAxios.get(league.url);
      const matches = response.data;
      // collect matches
      if (!Array.isArray(matches)) {
        console.log(`${league.url}: there is no match.`);
        continue;
      }
      for (let j = 0; j < matches.length; j++) {
        const item = matches[j];
        const eid = item.match.eid;
        const match = await matchSchemaModel.findOne({eid: eid});
        // console.log(match);
        if(!match) {
          let matchData = item.match;
          matchData.odds = item.odds[0];
          matchData.league_id = league._id;
          matchData.league_eid = league.eid;
          const matchDataResponse = await sportsAxios.get(item.match.url);
          matchData.data = matchDataResponse.data.match.data;
          console.log(matchData.country, matchData.league, matchData.match);
          const matchSchema = new matchSchemaModel(matchData);
          await matchSchema.save();
        }
      }
      // await Promise.all(matches.map( async (item) => {
        
      // }));
    }
    // await Promise.all(leagues.map( async (league) => {
      
    // }));
  });

  oddsCalcTask = cron.schedule('* * * * *', async function() {
    console.log("calculate odds per minute");
    const matches = await matchSchemaModel.find({status: "false"});
    // process.env.TZ = 'GMT+1';
    for (let i = 0; i < matches.length; i++) {
      const matchDate = matches[i].date.replace(/pm|am/i, "");
      const matchTimezone = matches[i].timezone;
      console.log(matchDate);
      const matchDay = matches[i].day;
      const mdate = new Date(`${matchDate} ${matchTimezone}`);
      const curdate = new Date();
      // const curTimezoneOffset = curdate.getTimezoneOffset();
      console.log(curdate, mdate);
      const timeDif = curdate - mdate;
      console.log(timeDif / 3600000);
      for (let index = 0; index < oddsTimeLine.length; index++) {
        if (timeDif >= oddsTimeLine[index].timeLine) {
          // console.log(oddsTimeLine[index], matches[i]._id);
          if (!matches[i][oddsTimeLine[index].ah_key]) {  // ah odds ** hours before
            let response = await sportsAxios.get(`${matches[i].url}/ah`);
            let oddsData = response.data;
            let mainLine = Object.keys(oddsData)[0];
            let paramObj = new Object();
            paramObj[oddsTimeLine[index].ah_key] = oddsData[mainLine];
            await matchSchemaModel.findByIdAndUpdate(matches[i]._id, paramObj);
            paramObj = {};
            paramObj[oddsTimeLine[index].ah_key] = oddsData;
            let oddsLog = await oddsLogSchemaModel.findOneAndUpdate({match_id: matches[i]._id}, paramObj);
            if (!oddsLog) {
              paramObj = {match_id: matches[i]._id, match_eid: matches[i].eid};
              paramObj[oddsTimeLine[index].ah_key] = oddsData;
              console.log(paramObj);
              let newOddsLog = new oddsLogSchemaModel(paramObj);
              await newOddsLog.save();
            }
          }
          if (!matches[i][oddsTimeLine[index].ou_key]) {  // ou odds ** hours before
            let response = await sportsAxios.get(`${matches[i].url}/ou`);
            let oddsData = response.data;
            let mainLine = Object.keys(oddsData)[0];
            let paramObj = new Object();
            paramObj[oddsTimeLine[index].ou_key] = oddsData[mainLine];
            await matchSchemaModel.findByIdAndUpdate(matches[i]._id, paramObj);
            paramObj = {};
            paramObj[oddsTimeLine[index].ou_key] = oddsData;
            let oddsLog = await oddsLogSchemaModel.findOneAndUpdate({match_id: matches[i]._id}, paramObj);
            if (!oddsLog) {
              paramObj = {match_id: matches[i]._id, match_eid: matches[i].eid};
              paramObj[oddsTimeLine[index].ou_key] = oddsData;
              let newOddsLog = new oddsLogSchemaModel(paramObj);
              await newOddsLog.save();
            }
          }
        }
      }
      // 24 hours before
      // if (timeDif >= -86400000) {
      //   if (!matches[i].ah_odds24h) {  // ah odds 24 hours before
      //     let oddsData = await sportsAxios.get(`${matches[i].url}/ah`);
      //     let mainLine = Object.keys(oddsData)[0];
      //     await matchSchemaModel.findByIdAndUpdate(matches[i]._id, {ah_odds24h: oddsData[mainLine]});
      //     let oddsLog = await oddsLogSchemaModel.findOneAndUpdate({match_id: matches[i]._id}, {ah_odds24h: oddsData});
      //     if (!oddsLog) {
      //       let newOddsLog = new oddsLogSchemaModel({match_id: matches[i]._id, match_eid: matches[i].eid, ah_odds24h: oddsData});
      //       await newOddsLog.save();
      //     }
      //   }
      //   if (!matches[i].ou_odds24h) {  // ou odds 24 hours before
      //     let oddsData = await sportsAxios.get(`${matches[i].url}/ou`);
      //     let mainLine = Object.keys(oddsData)[0];
      //     await matchSchemaModel.findByIdAndUpdate(matches[i]._id, {ou_odds24h: oddsData[mainLine]});
      //     let oddsLog = await oddsLogSchemaModel.findOneAndUpdate({match_id: matches[i]._id}, {ou_odds24h: oddsData});
      //     if (!oddsLog) {
      //       let newOddsLog = new oddsLogSchemaModel({match_id: matches[i]._id, match_eid: matches[i].eid, ou_odds24h: oddsData});
      //       await newOddsLog.save();
      //     }
      //   }
      // }
      
    }
  });

};

const initCron = async () => {
  
  // const response = await sportsAxios.get("soccer");
  // const leagues = response.data;
  const leagues = [];
  Promise.all(leagues.map( async (item) => {
    const eid = item.eid;
    const league = await leagueSchemaModel.findOne({eid: eid});
    // console.log(league);
    if(!league) {
      const leagueSchema = new leagueSchemaModel(item);
      await leagueSchema.save();
    }
  }));
  
  createCronJob();
};

const stopCron = async () => {
  await cronTask.stop();
};

module.exports = {
  initCron,
  stopCron
};
