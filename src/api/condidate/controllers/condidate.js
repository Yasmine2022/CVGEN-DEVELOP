'use strict';

/**
 * condidate controller
 */
var fs = require('fs');

const { createCoreController } = require('@strapi/strapi').factories;

const { v4: uuidv4 } = require('uuid');
const { Configuration, OpenAIApi } = require("openai");
const readlineSync = require("readline-sync");
require("dotenv").config();

function generateUuid() {
  return uuidv4();
}

// Exemple d'utilisation de la fonction generateUuid()
const uuid = generateUuid();

module.exports = createCoreController('api::condidate.condidate', ({ strapi }) => ({
    async uploadCv(ctx) {
        const { files } = ctx.request;
        let result = {}
        const file = files.file;
        let filePath = `${process.env.DIRETORY_PATH}/public/uploads/${Date.now()}.pdf`
        const fileContent = fs.readFileSync(file.path);
        fs.writeFileSync(filePath, fileContent);
        const pdfParse = require('pdf-parse');
        const PdfParser = async () => {
        let dataBuffer = fs.readFileSync(filePath);

        let data = await pdfParse(dataBuffer)
            console.log(data.text);

  // const configuration = new Configuration({
  //   apiKey: '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',
  // });
  // const openai = new OpenAIApi(configuration);

  // const history = [];

  // const user_input = `Given the following CV:  ${data.text} .
  //  Extract it in this following json form and groups technical Skills that are in common together in different categories of cv in general (like : Programming Languages,Web Development,Databases,Mobile Development,Operating Systems,Tools and Technologies,Data Analysis and Machine Learning,Networking and Security,Software Testing and QA,Software Development Methodologies .... )where the title is a name  prposed  by you and description is the list of skills  : { "firstName": "", "description": "", "identifier": "","uuid": "","expYears": "" ,"expMonths": "","lastName": "","job_title": "","theme": "zetabox","locale": "en","education": [{  "diploma": "","year": "","school": "" }],"languages": [{"speakingLevel": 2,"writingLevel": 2,"language": ""}],"experiences": [{"company": "","start": "","end": "","title": "","country": ""  }],"technicalSkills": [{ "title": "","description": "" }],"certificates": [{  "title": "", "description": "" }],"projects": [{"project": "","start": "","end": "","customer": "","country": ""}]} . I want that you return a valid format json . you can corrige the response to a json data format`
  // const messages = [];
  // while (true) {
  //   for (const [input_text, completion_text] of history) {
  //     messages.push({ role: 'user', content: input_text });
  //     messages.push({ role: 'assistant', content: completion_text });
  //   }
  //   messages.push({ role: 'user', content: user_input });

  //   try {
  //     // Make the OpenAI API call
  //     const completion = await openai.createChatCompletion({
  //       model: 'gpt-3.5-turbo',
  //       messages: messages,
  //     });

  //     // Extract the generated completion text from the API response
  //     const completion_text = completion.data.choices[0].message.content;

  //     // Add to history
  //     history.push([user_input, completion_text]);

  //     // Check if completion is finished
  //     if (completion.data.choices[0].finish_reason === 'stop') {
  //       break;
  //     }

  //   } catch (error) {
  //     console.error('Error calling OpenAI API:', error);
  //     break;
  //   }
  // }

  const { Configuration, OpenAIApi } = require('openai');
  const inputText = `
  Extract it in this following json form and groups technical Skills that are in common together in different categories of cv in general (like : Programming Languages,Web Development,Databases,Mobile Development,Operating Systems,Tools and Technologies,Data Analysis and Machine Learning,Networking and Security,Software Testing and QA,Software Development Methodologies .... )where the title is a name  prposed  by you and description is the list of skills  : { "firstName": "", "description": "", "identifier": "","uuid": "","expYears": "" ,"expMonths": "","lastName": "","job_title": "","theme": "zetabox","locale": "en","education": [{  "diploma": "","year": "","school": "" }],"languages": [{"speakingLevel": 2,"writingLevel": 2,"language": ""}],"experiences": [{"company": "","start": "","end": "","title": "","country": ""  }],"technicalSkills": [{ "title": "","description": "" }],"certificates": [{  "title": "", "description": "" }],"projects": [{"project": "","start": "","end": "","customer": "","country": ""}]} . I want that you return a valid format json . you can corrige the response to a json data format`
  
  const configuration = new Configuration({
    apiKey: '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',
  });
  const openai = new OpenAIApi(configuration);
  
      
    // Split input text into chunks that fit within the token limit
    const maxTokens = 4096;
    const chunks = [];
    for (let i = 0; i < data.text.length; i += maxTokens) {
      chunks.push(data.text.substring(i, i + maxTokens));
    }
  
    const responseChunks = [];
    let context = '';    
    for (const chunk of chunks) {
      const messages = [];
      messages.push({ role: 'assistant', content: inputText });

      messages.push({ role: 'user', content: chunk });
  
      try {
        const completion = await openai.createChatCompletion({
          model: 'gpt-3.5-turbo',
          messages: messages,
        });
  
        const completionText = completion.data.choices[0].message.content;
        responseChunks.push(completionText);
  
        context = completionText;
  
      } catch (error) {
        console.error('Error calling OpenAI API:', error);
        return 'An error occurred while generating the response.';
      }
    }
  
      const jsonChunks = responseChunks.join('\n').split('\n\n')[0];
      console.log(typeof(jsonChunks))
      console.log(jsonChunks)
      const startIndex = responseChunks.join('\n').indexOf('{');
      const endIndex = responseChunks.join('\n').indexOf(']\n}', startIndex) + 3;
      const firstJson = responseChunks.join('\n').substring(startIndex, endIndex);
      
      console.log('Extracted JSON:', firstJson);
    console.log(startIndex)
    console.log(endIndex)
 
  
  
  // Process the final completion_text into a valid JSON format
  try {
    const jsonObject = JSON.parse(firstJson);
    for (let key in jsonObject) {
      if (jsonObject.key == null) {
        delete jsonObject.key;
      }
    }
    
    
      
      jsonObject.uuid = generateUuid()
      jsonObject.identifier = generateUuid()
      jsonObject.expYears = parseInt(jsonObject.expYears);
      jsonObject.expMonths = parseInt(jsonObject.expMonths);

      if (isNaN(jsonObject.expYears)) {
        jsonObject.expYears = 0;
      }
      
      if (isNaN(jsonObject.expMonths)) {
        jsonObject.expMonths = 0;
      }
      
    
      jsonObject.locale = 'en'
      //console.log(jsonObject);
      const moment = require('moment');
        require('moment/locale/fr'); // Import the French locale for moment

//const inputDate = 'FEVRIER.2021';

// Custom mapping of month names to numeric values
const monthMap = {
JAN: '01',
  FEB: '02',
  MAR: '03',
  APR: '04',
  MAY: '05',
  JUN: '06',
  JUL: '07',
  AUG: '08',
  SEP: '09',
  OCT: '10',
  NOV: '11',
  DEC: '12',
};

// Set the locale to French
moment.locale('fr');

// Parse and convert the input date to the desired format
for (let education of jsonObject.education){
education.year= education.year.toString();
}
for (let project of jsonObject.experiences) {
  if(project.start === null || project.start === undefined || project.start==="" )
  {var today = new Date();
  var year = today.getFullYear();
  var month = String(today.getMonth() + 1).padStart(2, '0'); // Add leading zero if necessary
  var day = String(today.getDate()).padStart(2, '0'); // Add leading zero if necessary
  
  var formattedDate = year + '-' + month + '-' + day;
      project.end= formattedDate
      project.start= formattedDate}
 if (!(isDateFormatValid(project.start) && isDateFormatValid(project.end)) ){
  const transformedDatee = moment(project.start, 'MMMM.YYYY', 'fr')
.format('YYYY-MM-DD')
.replace((project.start).match(/([A-Z]+)/)[0], monthMap[project.start.match(/([A-Z]+)/)[0]]);
  if (isValidDate(project.end)){
    const transformedDates = moment(project.end, 'MMMM.YYYY', 'fr')
    .format('YYYY-MM-DD')
    .replace(project.end.match(/([A-Z]+)/)[0], monthMap[project.end.match(/([A-Z]+)/)[0]]);
    project.end=transformedDates
  }
 else { 
  var today = new Date();
var year = today.getFullYear();
var month = String(today.getMonth() + 1).padStart(2, '0'); // Add leading zero if necessary
var day = String(today.getDate()).padStart(2, '0'); // Add leading zero if necessary

var formattedDate = year + '-' + month + '-' + day;
  project.end= formattedDate
 }
// console.log(transformedDate); // Output: '2021-08-01'
// console.log(typeof(transformedDate))
project.start=transformedDatee
}
}
if (jsonObject.projects){
for (let project of jsonObject.projects) {
 if(project.start === null || project.start === undefined || project.start=="")
 {var today = new Date();
  var year = today.getFullYear();
  var month = String(today.getMonth() + 1).padStart(2, '0'); // Add leading zero if necessary
  var day = String(today.getDate()).padStart(2, '0'); // Add leading zero if necessary
  
  var formattedDate = year + '-' + month + '-' + day;
      project.end= formattedDate
      project.start= formattedDate}  
 if (!(isDateFormatValid(project.start) && isDateFormatValid(project.end)) ){
  const transformedDatee = moment(project.start, 'MMMM.YYYY', 'fr')
.format('YYYY-MM-DD')
.replace((project.start).match(/([A-Z]+)/)[0], monthMap[project.start.match(/([A-Z]+)/)[0]]);
  if (isValidDate(project.end)){
    const transformedDates = moment(project.end, 'MMMM.YYYY', 'fr')
    .format('YYYY-MM-DD')
    .replace(project.end.match(/([A-Z]+)/)[0], monthMap[project.end.match(/([A-Z]+)/)[0]]);
    project.end=transformedDates
  }
 else { 
  var today = new Date();
var year = today.getFullYear();
var month = String(today.getMonth() + 1).padStart(2, '0'); // Add leading zero if necessary
var day = String(today.getDate()).padStart(2, '0'); // Add leading zero if necessary

var formattedDate = year + '-' + month + '-' + day;
  project.end= formattedDate
 }
// console.log(transformedDate); // Output: '2021-08-01'
// console.log(typeof(transformedDate))
project.start=transformedDatee

}
}}
      
      console.log(jsonObject);
      
      const entry =  await strapi.entityService.create('api::condidate.condidate', 
      {
          data:jsonObject
        }
        );
        result = jsonObject;
        
    } catch (error) {
      console.error('Error parsing JSON:', error);
      console.log(JSON.stringify(error))
    }
  
  //await strapi.services.condidate.create(jsonObject)
        
  }
        await PdfParser()
        return result
    },
}));



function isValidDate(dateString) {
  var timestamp = Date.parse(dateString);
  return !isNaN(timestamp);
}

function isDateFormatValid(dateString) {
  // Utilise la regex pour vérifier le format de la date
  const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (!dateFormatRegex.test(dateString)) {
    return false;
  }

  // Vérifie si la date est valide en utilisant le constructeur Date de JavaScript
  const date = new Date(dateString);
  const isValidDate = !isNaN(date.getTime());

  return isValidDate;
}