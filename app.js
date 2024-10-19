const conn = require('./conn.js')
const express = require('express');
const app = express();
const multer = require ("multer");
const fs = require('fs');
const upload = multer({dest: "uploads/"}) //short sang destination
const AIgenerator = require('./AIgenerator');
const path = require('path');
const mammoth = require('mammoth');


app.set("view engine", "ejs");
app.use(express.static("public"));
app.use('/uploads', express.static('uploads'));

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    const quiz_data = `SELECT * FROM quiz`; 
    conn.query(quiz_data, (err, results) => {
        // based kay doc nga example
        if (err) {
            console.error(err);
            return res.status(500).send('Error');
        }

        const datarow = results.map(row => { // fetch ya ang data from db
            return [
                row.quiz_id,
                row.subject,
                row.user_score
            ];
        });

        res.render("index.ejs", { data: datarow }); //render ya para mapass sa index.ejs ang 'data'
    });
});

app.get('/docs', (req, res) => {
    res.render("docs.ejs");
});

// login process
app.get('/login',(req,res)=>{
    res.render("login.ejs")
})

// won't explain this since na tackle naman ni ni sir ry
app.post('/login', (req,res)=>{
    const login_email = req.body.login_email;
    const login_password = req.body.login_password;
    const get_login = `SELECT * from users WHERE user_email = "${login_email}" AND user_password = "${login_password}"`;

    conn.query(get_login,(err,result)=>{
        if (err) throw err;
        console.log("Login Successfully");
        res.send(`
            <script>
                alert("Login Successfully! Naol ");
                window.location.href="/";
            </script>
            `)
    })

});

// signup process
app.get('/signup', (req,res)=>{
    res.render('signup.ejs');
    
});

app.post('/signup',(req,res)=>{
    const id = 0;
    const signup_name = req.body.signup_name;
    const signup_email = req.body.signup_email
    const signup_username =  req.body.signup_username;
    const signup_password = req.body.signup_password;

    const insert_user = `INSERT INTO users VALUES ("${id}","${signup_name}","${signup_email}","${signup_username}","${signup_password}") `;

    conn.query(insert_user,(err,result)=>{
        if (err) throw err;
        console.log('Registered Successfully ^.^v! ');
        res.send(`
            <script>
                alert("Registered Successfully ^.^v! ");
                window.location.href="/login";
            </script>
            `)
    });
    
});

// file upload
const uploadFiles = (req, res) => {

    //get ya ni ang input ni user
    const subject = req.body.subject;
    const doctype = req.body.doctype; 
    const files = req.files;

    //use promise to process the read anf write function in order 
    //(why? -dugay ang response ni llama kung indi siya in order)
    const writePromises = files.map((file) => { // ano ang map? - para maka create new array kag indi maguba ang existing array
        const filepath = file.path; 

        return new Promise((resolve, reject) => {
            
            // checker kung ang file is DOCX    
            if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                mammoth.extractRawText({ path: filepath }) // module ni ang mammoth gin gamit ko para maka read sang docs
                    .then(result => {                       // why? without mammoth naka encrypt ang docs so si mammoth ang ga convert
                        const data = result.value; 
                        const uploadQuiz = filepath;

                        return processUploadedData(data, uploadQuiz, doctype,subject)
                            .then(resolve)  // ireturn ni process si data, uploadquiz, doctype, and subject para magamit pa sa iban nga function
                            .catch(reject); 
                    })
                    //error handler ni para makita dayun kung ano ang error sang program sa terminal
                    .catch(err => {
                        console.error('Error reading DOCX file:', err);
                        reject('Error reading DOCX file');
                    });
            } else {

                // muni tudlo ni sir ry 
                // what is async? daw instead sa maghulat ka matapos ang isa ka bagay, mahimo ka danay sang iban nga pwede mo mahimo
                fs.readFile(filepath, 'utf8', async (err, data) => {
                    if (err) {
                        console.error('Error reading file:', err);
                        return reject('Error reading file'); 
                    }

                    // await naman ya, from the word itself mahulat siya bago matapos si async 
                    try {
                        const uploadQuiz = filepath;
                        const quiz_id = await processUploadedData(data, uploadQuiz, doctype,subject);
                        console.log('Resolved quiz_id from processUploadedData:', quiz_id);
                        resolve(quiz_id); 
                    } catch (error) {
                        console.error('Error processing uploaded data:', error);
                        reject('Error generating response');
                    }
                });
            }
        });
    });

    Promise.all(writePromises) 
        .then((quizIds) => {  
            const firstQuizId = quizIds[0]; 

            // iredirect ya ka kay /quiz after matapos process si AI
            res.redirect(`/quiz/${firstQuizId}`); 
        })
        .catch((error) => {
            console.error('Error in processing files:', error); 
            res.status(500).json({ error }); 
        });
};

const processUploadedData = async (data, uploadQuiz, doctype,subject) => {
    const airesponse = await AIgenerator(data, doctype); 
    // muni ang structure sang igenerate nga questions ni AI
    const questions = airesponse.map(item => ({
        question: item.question,
        options: item.options || [], 
        answer: item.answer 
    }));

    // Then himuon nga string si ai respons since halin ni siya sa json file bali json to string para maread siya easily
    const aiResponseJson = JSON.stringify(questions, null, 2);

    //iwrite ya ni sa path nga gin butang ko
    fs.writeFileSync(path.join(__dirname, 'uploads/test.json'), aiResponseJson);
    console.log(' response written to test.json'); 

    //inserting
    const pathInsert = `INSERT INTO quiz (doctype, subject, upload_quiz, upload_response) VALUES (?,?, ?, ?)`;
    return new Promise((resolve, reject) => {
        conn.query(pathInsert, [doctype,subject, uploadQuiz, aiResponseJson], (err, result) => {
            if (err) {
                console.error('Error inserting into database:', err);
                return reject('Insert error');
            }

            const quiz_id = result.insertId; 
            console.log('Data inserted into database successfully! Quiz ID:', quiz_id);
            resolve(quiz_id); 
        });
    });
};

app.post("/upload_files", upload.array("files"), uploadFiles);

//generated quiz and automatic na HSEUFDGHFASLKDF THANK YOU LORD!
app.get('/quiz/:quiz_id', (req, res) => {
    //maget ko ang id nga ara sa url then ikwaon ni params ang quiz_id
    const quiz_id = req.params.quiz_id;
    const quiz_data = `SELECT upload_response FROM quiz WHERE quiz_id = ?`;
    
    conn.query(quiz_data, [quiz_id], (err, data) => {
        if (err) {
            return res.status(500).send('Error loading quiz');
        }
        

        if (data.length > 0) { // icheck ya ang length para sa response if wala then indi ya pag icalculate/irender
            try {
                const uploadResponse = data[0].upload_response;
                const questions = JSON.parse(uploadResponse);  // muni ang ga hold sang quiz response bali iconvert ya si string to json liwat
                const answerkey = answers(questions); //answer key
                
                // based sa example ni sir ryan, this is the way kung paano idisplay si quiz
                res.render("quiz", {
                    title: "Quiz",
                    action: "list",
                    questions: questions,
                    answerkey: answerkey,
                    quiz_id: quiz_id 
                });
            } catch (parseError) {
                console.error('Error parsing upload_response:', parseError);
                // 500 = Internal Service Error
                return res.status(500).send('Error processing');
            }
        } else {
            console.log(`No data found for quiz_id: ${quiz_id}`);
            return res.status(404).send("Quiz not found");
        }
    });
});

// para maview ni user ang answer key
app.get('/answerkey', (req, res) => {
    const score = req.query.score; 

    // iread ya ni si test.json
    fs.readFile(path.join(__dirname, 'uploads/test.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the JSON file:', err);
            //for server error
            return res.status(500).send('Error loading answer key');
        }
        
        // kwaon ni ang questions and answer nga halin sa test.json
        const questions = JSON.parse(data);
        const answerkey = questions.map(q => ({
            question: q.question,
            answer: q.answer 
        }));
        res.render('answerkey', { answerkey, score }); 
    });
});

// gina kwa ya ang list sang question and answer tapos maproduce siya another list para mag simple ang pagretrive sang data
const answers = (questions) => {
    return questions.map((question) => ({
        question: question.question,
        answer: question.answer 
    }));
};

// automatic na sa wakas!!!!!
app.post('/submit_score', (req, res) => {
    const { quiz_id, user_score } = req.body;
    console.log('Received score submission:', req.body);
    const updated_score = `UPDATE quiz SET user_score = ? WHERE quiz_id = ?`;

    // indi ko na pagexplain gets niyo naman ni guro
    conn.query(updated_score, [user_score, quiz_id], (err, result) => {
        if (err) {
            console.error('Error updating score:', err);
            return res.status(500).send('Error updating score');
        }
        console.log('Score updated successfully', result);
        res.status(200).json({ message: 'Score submitted successfully' });
    });
});



//AICHAT NA NI YES YES
app.get('/chat', (req, res) => {
    const query = 'SELECT * FROM chatbot ORDER BY chat_id ASC';
    conn.query(query, (err, results) => {
        if (err) throw err;
        res.render('chat', { messages: results });
    });
});

const AIchatbot = require('./AIchatbot'); 

app.post('/send_message', async (req, res) => {
    const { username, message_one } = req.body;

    try {
        const userQuery = 'INSERT INTO chatbot (username, message_one) VALUES (?, ?)';
        conn.query(userQuery, [username, message_one], (err) => {
            if (err) throw err;
            console.log('User message saved');
        });
        const botResponse = await AIchatbot(message_one);
        const botName = 'ThinkTank';

        const botQuery = 'INSERT INTO chatbot (bot_name, botmessage) VALUES (?, ?)';
        conn.query(botQuery, [botName, botResponse], (err) => {
            if (err) throw err;
            console.log('Bot response saved');
        });

        res.json({ reply: botResponse });
    } catch (error) {
        console.error('Error handling message:', error);
        res.status(500).json({ error: 'Error processing message' });
    }
});


app.listen(3000,()=>{
    console.log("Listening...");
});
