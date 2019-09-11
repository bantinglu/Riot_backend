const router = require('express').Router();
const { Kayn, REGIONS } = require('kayn');
const kayn = Kayn(process.env.API_KEY)();

var jsonQuery = require('json-query')
var items = require('./../item.json');
var runes = require('./../runesReforged.json');
var summoners = require('./../summoner.json');
var champs = require('./../champion.json');
 
router.route('/:name').get((req, res) => {
    
    var matchesReturns = [];
 
    kayn.Summoner.by.name(req.params.name)
    .then(summoner => {
        kayn.Matchlist.by.accountID(summoner['accountId'])
            .region(REGIONS.NORTH_AMERICA)
            .then (matchlist=> {
                var matchPromises = [];
                //FOR BREVITY - determines how many matches to search
                matchlist.matches.slice(0,5).map( x => {
                   
                    var matchPromise = new Promise(function(resolve, reject) {
                        kayn.Match.get(x['gameId']).then(game => {
                            resolve(game);
                        });
                    });
                    matchPromises.push(matchPromise);
                });
 
                Promise.all(matchPromises).then(games => {
                    games.forEach(game =>{

                        var id = (game['participantIdentities'].filter(x => x['player']['summonerName'].toUpperCase()==req.params.name.toUpperCase()))[0]['participantId'];
                        var player = game['participants'].filter(x => x['participantId'] == id)[0];
                        var teamID = player['teamId'];

                        console.log(player)
                        var matchDetails = {
                            outcome: game['teams'].filter(x=> x['teamId']==teamID)[0]['win'],
                            duration: game['gameDuration'],
                            summonerSpells : {
                                "spell1": jsonQuery('data[**][key='+player['spell1Id']+']', { data: summoners}).value['name'],
                                "spell2": jsonQuery('data[**][key='+player['spell2Id']+']', { data: summoners}).value['name']
                            },
                            KDA : player['stats']['kills'] + "/" + player['stats']['deaths'] + "/" + player['stats']['assists'],
                            championName: jsonQuery('data[**][key='+player['championId']+']', { data: champs}).value['name'],
                            maxLevel: player['stats']['champLevel'],
                            totalCS:  player['stats']['totalMinionsKilled'] + player['stats']['neutralMinionsKilled'],
                            items:{
                                item0: player['stats']['item0'] ? items['data'][player['stats']['item0']]['name'] : "empty",
                                item1: player['stats']['item1'] ? items['data'][player['stats']['item1']]['name'] : "empty",
                                item2: player['stats']['item2'] ? items['data'][player['stats']['item2']]['name'] : "empty",
                                item3: player['stats']['item3'] ? items['data'][player['stats']['item3']]['name'] : "empty",
                                item4: player['stats']['item4'] ? items['data'][player['stats']['item4']]['name'] : "empty",
                                item5: player['stats']['item5'] ? items['data'][player['stats']['item5']]['name'] : "empty",
                                item6: player['stats']['item6'] ? items['data'][player['stats']['item6']]['name'] : "empty"
                            },
                            perks : {
                                perk0: jsonQuery('slots.runes[id='+player['stats']['perk0']+']', { data: runes}).value['key'],
                                perk1: jsonQuery('slots.runes[id='+player['stats']['perk1']+']', { data: runes}).value['key'],
                                perk2: jsonQuery('slots.runes[id='+player['stats']['perk2']+']', { data: runes}).value['key'],
                                perk3: jsonQuery('slots.runes[id='+player['stats']['perk3']+']', { data: runes}).value['key'],
                                perk4: jsonQuery('slots.runes[id='+player['stats']['perk4']+']', { data: runes}).value['key'],
                                perk5: jsonQuery('slots.runes[id='+player['stats']['perk5']+']', { data: runes}).value['key']
                            }
                        };
 
                        matchesReturns.push(matchDetails);
                    });
 
                    
                    res.status(200).json(matchesReturns);
                });
            })
    })
    .catch(error => console.error(error))
 
});


module.exports = router;