var fs = require('fs');
var path = require('path');

fs.readdir('./utils/defs', function (err, languages) {
  if (err) {
    console.error('Could not list the directory.', err);
    process.exit(1);
  }

  let activity = 'export const DestinyActivityDefinition = {\n'

  languages.forEach((language, index) => {
    console.log('processing activity', language);
    activity += '  ' + language + ': {\n';

    let definitionFile = fs.readFileSync('./utils/defs/' + language + '/DestinyActivityDefinition.json');
    let defs = JSON.parse(definitionFile);

    for (let property in defs) {
      activity += '    ' + property + ': {\n';
      try {
        activity += '      name: \'' + defs[property].displayProperties.name.replace(/'/g, "\\'").replace(/[\n\r]/g, '') + '\'\n';
      } catch (e) {}
      activity += '    },\n';
    }

    activity += '  },\n';
  });

  console.log('processing activity data');
  activity += '  data: {\n';

  let definitionFile = fs.readFileSync('./utils/defs/en/DestinyActivityDefinition.json');
  let defs = JSON.parse(definitionFile);

  for (let property in defs) {
    activity += '    ' + property + ': {\n';
    activity += '      icon: \'' + defs[property].displayProperties.icon + '\',\n'
    activity += '      pgcrImage: \'' + defs[property].pgcrImage + '\'\n';
    activity += '    },\n';
  }

  activity += '  },\n';

  activity += '};\n';

  fs.writeFile('./src/app/defs/DestinyActivityDefinition.ts', activity, function (err) {
    if (err) throw err;
  });



  let mode = 'export const DestinyActivityModeDefinition = {\n'

  languages.forEach((language, index) => {
    console.log('processing mode', language);
    mode += '  ' + language + ': {\n';

    let definitionFile = fs.readFileSync('./utils/defs/' + language + '/DestinyActivityModeDefinition.json');
    let defs = JSON.parse(definitionFile);

    let zeroFound = false;
    for (let property in defs) {
      if (defs[property].modeType === 0) {
        if (zeroFound) {
          continue;
        }
        zeroFound = true;
      }
      mode += '    ' + defs[property].modeType + ': {\n';
      try {
        mode += '      name: \'' + defs[property].displayProperties.name.replace(/'/g, "\\'").replace(/[\n\r]/g, '') + '\'\n';
      } catch (e) {}
      mode += '    },\n';
    }

    mode += '  },\n';
  });

  console.log('processing mode data');
  mode += '  data: {\n';

  let modeDefinitionFile = fs.readFileSync('./utils/defs/en/DestinyActivityModeDefinition.json');
  let modeDefs = JSON.parse(modeDefinitionFile);

  for (let property in modeDefs) {
    mode += '    ' + property + ': {\n';
    mode += '      icon: \'' + modeDefs[property].displayProperties.icon + '\',\n'
    mode += '      pgcrImage: \'' + modeDefs[property].pgcrImage + '\',\n'
    mode += '      category: \'' + modeDefs[property].activityModeCategory + '\'\n'
    mode += '    },\n';
  }

  mode += '  },\n';

  mode += '};\n';

  fs.writeFile('./src/app/defs/DestinyActivityModeDefinition.ts', mode, function (err) {
    if (err) throw err;
  });



  let dclass = 'export const DestinyClassDefinition = {\n';

  languages.forEach((language, index) => {
    console.log('processing class', language);
    dclass += '  ' + language + ': {\n';

    let definitionFile = fs.readFileSync('./utils/defs/' + language + '/DestinyClassDefinition.json');
    let defs = JSON.parse(definitionFile);

    for (let property in defs) {
      dclass += '    ' + property + ': {\n';
      dclass += '      name: \'' + defs[property].displayProperties.name.replace(/'/g, "\\'").replace(/[\n\r]/g, '') + '\'\n';
      dclass += '    },\n';
    }

    dclass += '  },\n';
  });

  dclass += '};\n';

  fs.writeFile('./src/app/defs/DestinyClassDefinition.ts', dclass, function (err) {
    if (err) throw err;
  });



  let race = 'export const DestinyRaceDefinition = {\n';

  languages.forEach((language, index) => {
    console.log('processing race', language);
    race += '  ' + language + ': {\n';

    let definitionFile = fs.readFileSync('./utils/defs/' + language + '/DestinyRaceDefinition.json');
    let defs = JSON.parse(definitionFile);

    for (let property in defs) {
      race += '    ' + property + ': {\n';
      race += '      name: \'' + defs[property].displayProperties.name.replace(/'/g, "\\'").replace(/[\n\r]/g, '') + '\'\n';
      race += '    },\n';
    }

    race += '  },\n';
  });

  race += '};\n';

  fs.writeFile('./src/app/defs/DestinyRaceDefinition.ts', race, function (err) {
    if (err) throw err;
  });



  let emblem = 'export const EmblemDefinition = {\n';
  
    console.log('processing emblems');

    let emblemFile = fs.readFileSync('./utils/defs/en/Emblem.json');
    let emblems = JSON.parse(emblemFile);

    for (let property in emblems) {
      if (emblems[property].itemTypeDisplayName === 'Emblem') {
        emblem += '    ' + property + ': {\n';
        emblem += '      icon: \'' + emblems[property].displayProperties.icon + '\',\n'
        emblem += '      secondaryIcon: \'' + emblems[property].secondaryIcon + '\'\n'
        emblem += '    },\n';
      }
    }
    
    emblem += '};\n';
  
    fs.writeFile('./src/app/defs/EmblemDefinition.ts', emblem, function (err) {
      if (err) throw err;
    });
});
