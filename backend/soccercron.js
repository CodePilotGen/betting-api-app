const cron = require('node-cron');
const dateFormat = require('date-format');
const {leagueSchemaModel} = require("./models/leagueModel");
const {matchSchemaModel} = require("./models/matchModel");
const {sportsAxios} = require("./brokersportsaxios");

let cronTask, oddsCalcTask, refreshMatchesTask;

const createCronJob = () => {

  // cronTask = cron.schedule('* * * * * *', function() {
  //   console.log('running a task every second', dateFormat('yyyy.MM.dd hh:mm:ss.SSS', new Date()));
  // });

  refreshMatchesTask = cron.schedule('59 23 * * *', async function() {
    console.log('running a task every day 23:59', dateFormat('yyyy.MM.dd hh:mm:ss.SSS', new Date()));
    const leagues = await leagueSchemaModel.find();
    // console.log(leagues);
    for (let i = 0; i < leagues.length; i++) {
      const league = leagues[i];
      const response = await sportsAxios.get(league.url);
      const matches = response.data;
      console.log(league.url, matches);
      // collect matches
      if (!Array.isArray(matches)) {
        continue;
      }
      for (let j = 0; j < matches.length; j++) {
        const item = matches[j];
        const eid = item.match.eid;
        const match = await matchSchemaModel.findOne({eid: eid});
        console.log(match);
        if(!match) {
          let matchData = item.match;
          matchData.odds = item.odds[0];
          matchData.league_id = league._id;
          matchData.league_eid = league.eid;
          const matchDataResponse = await sportsAxios.get(item.match.url);
          matchData.data = matchDataResponse.data.match.data;
          console.log(matchData);
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
