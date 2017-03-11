var fs = require('fs');
var path = require('path');

fs.readdir('./utils/defs', function (err, languages) {
  if (err) {
    console.error("Could not list the directory.", err);
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
      activity += '      activityName: "' + defs[property].activityName + '"\n';
      activity += '    },\n';
    }

    activity += '  },\n';
  });

  console.log('processing activity images');
  activity += '  images: {\n';

  let definitionFile = fs.readFileSync('./utils/defs/en/DestinyActivityDefinition.json');
  let defs = JSON.parse(definitionFile);

  for (let property in defs) {
    activity += '    ' + property + ': {\n';
    activity += '      pgcrImage: "' + defs[property].pgcrImage + '"\n';
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

    for (let property in defs) {
      mode += '    ' + defs[property].modeType + ': {\n';
      mode += '      modeName: "' + defs[property].modeName + '"\n';
      mode += '    },\n';
    }

    mode += '  },\n';
  });

  mode += '};\n';

  fs.writeFile('./src/app/defs/DestinyActivityModeDefinition.ts', mode, function (err) {
    if (err) throw err;
  });


  
  let dclass = 'export const DestinyClassDefinition = {\n';

  languages.forEach((language, index) => {
    console.log('processing mode', language);
    dclass += '  ' + language + ': {\n';

    let definitionFile = fs.readFileSync('./utils/defs/' + language + '/DestinyClassDefinition.json');
    let defs = JSON.parse(definitionFile);

    for (let property in defs) {
      dclass += '    ' + property + ': {\n';
      dclass += '      className: \'' + defs[property].className + '\'\n';
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
    console.log('processing mode', language);
    race += '  ' + language + ': {\n';

    let definitionFile = fs.readFileSync('./utils/defs/' + language + '/DestinyRaceDefinition.json');
    let defs = JSON.parse(definitionFile);

    for (let property in defs) {
      race += '    ' + property + ': {\n';
      race += '      raceName: \'' + defs[property].raceName + '\'\n';
      race += '    },\n';
    }

    race += '  },\n';
  });

  race += '};\n';

  fs.writeFile('./src/app/defs/DestinyRaceDefinition.ts', race, function (err) {
    if (err) throw err;
  });
});