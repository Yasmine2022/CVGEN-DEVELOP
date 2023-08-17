'use strict';

const Handlebars = require('handlebars');
const fs = require('fs');
const service = require("../services/Html2Pdf");
const puppeteer = require('puppeteer');
const marked = require('marked');
const os = require("os");
const hostname = os.hostname();

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::cv.cv', ({ strapi }) => ({
  async printCv(ctx) {
    try {
      let {firstname, lastname} = ctx.query
      
      let uuid = ctx.params.id;
      let filters = {
        filters: { uuid },
          populate: {
          projects: {
            populate: {
              element: true,
              logo: true,
            }
          },
          education: true,
          languages: true,
          experiences: true,
          certificates: true,
          technicalSkills: true
        }
      }
      let locale = "en"
      let condidate = await strapi.entityService.findMany('api::condidate.condidate', filters);
      if(!condidate?.length ) {
        condidate = await strapi.entityService.findMany('api::condidate.condidate', {...filters, locale: 'fr-FR'});
        locale = 'fr-FR';
      }
      let folder = locale === "en" ? "Competence file" : "Dossier de compétence"
      let competence = locale === "en" ? "Academic competence" : "Compétence académique"
      let experience = locale === "en" ? "Professional experience" : "Expérience professionnelle"
      let skills = locale === "en" ? "Technical skills" : "Compétences techniques"
      let project = locale === "en" ? "Professional projects" : "Projets professionnels"
      const cv = condidate[0];
      let theme = cv.theme
      let source = fs.readFileSync(`${process.env.DIRETORY_PATH}/public/views/cv.hbs`);
      const css = fs.readFileSync(`${process.env.DIRETORY_PATH}/public/views/style.css`, 'utf-8');
      const host = `http://${ctx.headers.host}`;
      const notEnd = locale === "en" ? "Today" : "Maintenant";
      const from = locale === "en" ? "from" : "de";
      const to = locale === "en" ? "to" : "jusqu'à";
      const langs = locale === "en" ? "Languages" : "Langues";
      let template = Handlebars.compile(source.toString());
      let name = "";
      if(firstname) {
        name += `${cv?.firstName} `
      } else {
        name += cv?.firstName?.charAt(0).toUpperCase()
      }
      if(lastname) {
        name += firstname ? `${cv?.lastName}` : ` ${cv?.lastName} `
      } else {
        name += cv?.lastName?.charAt(0).toUpperCase()
      }
      let environment = locale === "en" ? "Technical environment" : "Environnement Technique";
      let certifs = locale === "en" ? "Certifications" : "Certifications";
      let experienceYears = locale === "en" ? "Experience" : "Expérience";
      let experienceYearsStr = locale === "en" ? 
        `${cv?.expYears} ${cv?.expYears > 1 ? 'years' : 'year'} ${cv.expMonths ? 'and ' + cv.expMonths + (cv.expMonths > 1 ? ' months' : ' month') : '' }` 
        : 
        `${cv?.expYears} ${cv?.expYears > 1 ? 'ans' : 'an'} ${cv.expMonths ? 'et ' + cv.expMonths +  (cv.expMonths > 1 ? ' mois' : ' moi') : '' }` 

      let speaking = locale === "en" ? "Speaking" : "Parlé";
      let writing = locale === "en" ? "Writing" : "Ecrit";
      let languages = cv.languages.map(l => {
        let speakingLevel = "B2";
        switch (l.speakingLevel) {
          case 0:
            speakingLevel = "A1"
            break;
          case 1:
            speakingLevel = "A2"
            break;
          case 2:
            speakingLevel = "B1"
            break;
          case 3:
            speakingLevel = "B2"
            break;
          case 4:
            speakingLevel = "C1"
            break;
          case 5:
            speakingLevel = "C2"
            break;
          default:
            speakingLevel = "B2"
            break;
        }
        let writingLevel = "B2";
        switch (l.writingLevel) {
          case 0:
            writingLevel = "A1"
            break;
          case 1:
            writingLevel = "A2"
            break;
          case 2:
            writingLevel = "B1"
            break;
          case 3:
            writingLevel = "B2"
            break;
          case 4:
            writingLevel = "C1"
            break;
          case 5:
            writingLevel = "C2"
            break;
          default:
            writingLevel = "B2"
            break;
        }
        return {...l, writingLevel, speakingLevel, speaking, writing}
      })
      let pathName = strapi.config.get('server.url');
      let data = {
        name,
        job_title: cv.job_title,
        isZeta: theme === "zetabox",
        isWiconex: theme === "wiconnex",
        isDefault: theme === "default",
        experience,
        environment,
        certifs,
        skills,
        project,
        "css": css,
        "host": host,
        profile: cv,
        educations: cv.education,
        experiences: cv.experiences.map(el => ({
          ...el, 
          folder, 
          experience, 
          name,
          description: marked.parse(el.description || ""),
          date: `${from} ${el.start} ${to} ${el.end ? el.end : notEnd}`
        })),
        projects: cv.projects.map(el => ({
          ...el, 
          folder, 
          project, 
          name: el.project,
          description: marked.parse(el.description || ""),
          date: `${from} ${el.start} ${to} ${el.end ? el.end : notEnd}`,
          elements: el.element.map(item => ({...item, description: marked.parse(item.description || "")})),
          logo: el.logo ? `${pathName}${el.logo.url}` : '',
          hasLogo: !!el.logo
        })),
        hasTechnicalSkills: cv.technicalSkills && cv.technicalSkills.length,
        technicalSkills: cv.technicalSkills,
        certificates: cv.certificates,
        hasCertificates: cv.certificates && cv.certificates.length,
        hasSecondPage: (cv.certificates && cv.certificates.length) || (cv.technicalSkills && cv.technicalSkills.length),
        languages,
        folder,
        competence,
        experienceYears,
        langs,
        cv,
        experienceYearsStr
      };
      let result = template(data);
      ctx.set("Content-Type", "application/pdf");
      let pdfGenerated = await service.html2pdf(result,  {
        format: "A4",
        scale: 1,
      });
      ctx.body = pdfGenerated;
      return pdfGenerated;
    } catch (err) {
      console.log(err)
      ctx.body = err;
    }
  },
}));