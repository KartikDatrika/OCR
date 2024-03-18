const express = require('express');
const bodyParser = require('body-parser');
const db = require('./db');
const axios = require('axios');
const _ = require('lodash');

const app = express();
const port = process.env.PORT || '3000';

/* Set the path to the Git repository
@ Create DB_NAME: dmv_translated_posts 
@ Create DB_NAME: dmv_base_db_nz with NZ database and execute below queries
  1. DELETE FROM `wp_posts` where post_type IN ( "page" , "revision" ) and post_content like "%[wp_quiz_pro id=%" ;
 2. DELETE FROM `wp_posts` where post_type ="wp_quiz" and post_content !=""; 
*/


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const listOfdatabaseNames = ["dmv-germany"];

const selectQueryPostSelectFields = " \`ID\`, \`post_author\`, \`post_date\`, \`post_date_gmt\`, \`post_content\`, \`post_title\`, \`post_excerpt\`, \`post_status\`, \`comment_status\`, \`ping_status\`, \`post_password\`, \`post_name\`, \`to_ping\`, \`pinged\`, \`post_modified\`, \`post_modified_gmt\`, \`post_content_filtered\`, \`post_parent\`, \`guid\`, \`menu_order\`, \`post_type\`, \`post_mime_type\`, \`comment_count\`";
app.get('/data', async (req, res) => {
    const language = req.query.lang;
    const database = req.query.db;
    const tablePrefix = req.query.prefix;
    const sourceLang = req.query.prefix;
    const targetLang = req.query.prefix;

    console.log(database);
    const pool = await db.getConnection();
    const query = `Select ${selectQueryPostSelectFields} from \`${database}\`.\`${tablePrefix}_posts\` where post_type in ('wp_quiz') limit 10`;

    const result = await db.executeQuery(pool, query);
    res.send({ result, language, database });
});


const createPostsTable = async (database, tablePrefix, targetLang) => {
    const pool = await db.getConnection();
    const ignoreInvalidDates = "set global sql_mode = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';"
    await db.executeQuery(pool, ignoreInvalidDates);
    if (targetLang != "") {
        const createLangPostQuery = `CREATE TABLE IF NOT EXISTS \`${database}\`.\`${tablePrefix}_posts_${targetLang}\` AS SELECT ${selectQueryPostSelectFields} from \`${database}\`.\`${tablePrefix}_posts\` where post_type in ('wp_quiz')`;
        try {
            const createTable = await db.executeQuery(pool, createLangPostQuery);

            //const translateFlagQueryUp = `ALTER TABLE \`${database}\`.${tablePrefix}_posts  ADD \`translated\` INT NOT NULL DEFAULT '0' AFTER \`comment_count\``;
           // const createtranslatedFlag = await db.executeQuery(pool, translateFlagQueryUp);
        } catch (e) {
            console.error(e);
            return 0;
        }
    }
    pool.release();
    return 1;
}
const gTranslate = async (content, sourceLang, targetLang) => {
    try {
        //`https://www.googleapis.com/language/translate/v2?key=<API_KEY>&source=${sourceLang}&target=${targetLang}&callback=translateText&q=${encodeURI(content)}`
        let url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURI(content)}`;

        //const url = `https://translation.googleapis.com/language/translate/v2?key=<API_KEY>&source=${sourceLang}&target=${targetLang}&callback=translateText&q=${encodeURI(content)}`;

        let res = await axios.get(url);
        return res.data[0][0][0];
    } catch (e) {
        console.error(e);
        return "failed to translate";
    }
}

app.get('/translate', async (req, res) => {

    const database = req.query.db;
    const tablePrefix = req.query.prefix;
    const sourceLang = req.query.s_lang;
    const targetLang = req.query.t_lang;
    const pool = await db.getConnection();
    try {
        const createPostsTables = await createPostsTable(database, tablePrefix, targetLang);
        console.info(`Created required tables for translations${targetLang}`);
    } catch (e) {
        console.error(e);
    }

    const getQuery = `SELECT ${selectQueryPostSelectFields} FROM \`${database}\`.\`${tablePrefix}_posts\` where post_type in ('wp_quiz') and  post_content !='' order by post_title`;
    var timetaken = "Time taken by translation function";
    // Starts the timer. The label value is timetaken 
    console.time(timetaken);
    const rows = await db.executeQuery(pool, getQuery);
    for (let i = 0; i < rows.length; i++) {
        // Split based ',' and loop for languages
        // sleep for 10 mins

        console.info(`Started Translation for ${targetLang}`);
        let translatedPostTitle = rows[i].post_title ? await gTranslate(rows[i].post_title, sourceLang, targetLang) : '';
        console.log("translatedPostTitle ", translatedPostTitle);
        try {
            // Ignore empty content fields
            let postContent = JSON.parse(rows[i].post_content);
            let postContentTranslated = JSON.parse(rows[i].post_content);
            let questionKeys = Object.keys(postContent.questions);
            for (let j = 0; j < questionKeys.length; j++) {

                let transaltedQuestionTitle = postContent.questions[questionKeys[j]].title ? await gTranslate(postContent.questions[questionKeys[j]].title, sourceLang, targetLang) : '';
                postContentTranslated.questions[questionKeys[j]].title = transaltedQuestionTitle;
                let answerKeys = Object.keys(postContent.questions[questionKeys[j]].answers);

                for (let k = 0; k < answerKeys.length; k++) {

                    let transaltedAnswerTitle = postContent.questions[questionKeys[j]].answers[answerKeys[k]].title ? await gTranslate(postContent.questions[questionKeys[j]].answers[answerKeys[k]].title, sourceLang, targetLang) : '';
                    postContentTranslated.questions[questionKeys[j]].answers[answerKeys[k]].title = transaltedAnswerTitle;
                }
            }
            let stringifiedDataTranslated = JSON.stringify(postContentTranslated);
            stringifiedDataTranslated = stringifiedDataTranslated.replace(/'/g, "''");
            translatedPostTitle = translatedPostTitle.replace(/'/g, "''");
            const putQuery = `update \`${database}\`.\`${tablePrefix}_posts_${targetLang}\` set post_title = '${translatedPostTitle}', post_content = '${stringifiedDataTranslated}' where ID in (${rows[i].ID})`;
            await db.executeQuery(pool, putQuery);

            //const putBaseQuery = `update \`${database}\`.${tablePrefix}_posts set translated=1 where ID in (${rows[i].ID})`;
            //await db.executeQuery(pool, putBaseQuery);
        } catch (e) {

            console.log(e);
        }
    }
    //const translatedFlagDownQuery = `ALTER TABLE \`${database}\`.${tablePrefix}_posts DROP \`translated\``;
    //await db.executeQuery(pool, translatedFlagDownQuery);
    

    try {
                
        const createtranslatedBasePostTableQuery = `CREATE TABLE IF NOT EXISTS \`dmv_translated_posts\`.\`wp_posts_${database}_${ targetLang }\` AS SELECT ${selectQueryPostSelectFields} from \`dmv_base_db_nz\`.wp_posts where 1`;
        
        const createLangPostQuery = `INSERT INTO \`dmv_translated_posts\`.\`wp_posts_${database}_${ targetLang }\` SELECT ${selectQueryPostSelectFields} from \`${database}\`.\`${tablePrefix}_posts_${ targetLang }\` where post_type in ('wp_quiz') and post_content !=""`;
        
        console.log('createtranslatedBasePostTableQuery',createtranslatedBasePostTableQuery)
        console.log('createLangPostQuery',createLangPostQuery)

        await db.executeQuery(pool, createtranslatedBasePostTableQuery);
        await db.executeQuery(pool, createLangPostQuery);
    } catch (e) {
        console.log(e);
    }
    console.timeEnd(timetaken);
    pool.release();
    res.send({
        message: 'successful'
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})
app.timeout = 10000;