const conn = require('./conn.js')
const express = require('express');
const app = express();
const multer = require ("multer");
const fs = require('fs');
const upload = multer({dest: "uploads/"}) //short sang destination
const AIgenerator = require('./AIgenerator');
const path = require('path');


app.set("view engine", "ejs");
app.use(express.static("public"));
app.use('/uploads', express.static('uploads'));

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
    res.render("index.ejs");
});

app.get('/docs', (req, res) => {
    res.render("docs.ejs");
});

// login process
app.get('/login',(req,res)=>{
    res.render("login.ejs")
})

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
        console.log('Registered Successfully -.-! ');
        res.send(`
            <script>
                alert("Registered Successfully. Congrats, beh! ");
                window.location.href="/login";
            </script>
            `)
    });
    
});

// file upload
const uploadFiles = (req, res) => {
    const doctype = req.body.doctype; 
    const files = req.files;

    const writePromises = files.map(async (file) => {
        const filepath = file.path; 
        
        //para maging order ang pag read and write 
        return new Promise((resolve, reject) => {
            fs.readFile(filepath, 'utf8', async (err, data) => {
                if (err) {
                    console.error('Error reading file:', err);
                    return reject('Error reading file'); 
                }

                try {
                    const airesponse = await AIgenerator(data, doctype); 
                    const questions = airesponse.map(item => ({
                        question: item.question,
                        options: item.options,
                        answer: item.answer 
                    }));

                    // json to string para ma generate to quiz form (note: not yet finished)
                    const aiResponseJson = JSON.stringify(questions, null, 2);
                    fs.writeFileSync(path.join(__dirname, 'uploads/test.json'), aiResponseJson);
                    console.log('Success siya, yehey!'); 

                    const id = 0;
                    const uploadQuiz = filepath;
                    const response_path = "uploads/test.json";
                    const pathinsert = `INSERT INTO quiz (quiz_id, doctype, upload_quiz, upload_response) VALUES (${id}, '${doctype}', '${uploadQuiz}', '${aiResponseJson}')`;

                    conn.query(pathinsert, (err, result) => {
                        if (err) {
                            console.error('Error inserting into database:', err);
                            return reject('Database insert error');
                        }
                        console.log('Nainsert ang data, very good!');
                        resolve(); 
                    });
                } catch (error) {
                    console.error('Error:', error);
                    reject('Error generating response'); 
                }
            });
        });
    });

    Promise.all(writePromises) 
        .then(() => {
            res.json({ message: 'All files processed successfully' }); 
        })
        .catch((error) => {
            console.error('Error in processing files:', error); 
            res.status(500).json({ error }); 
        });
};

app.post("/upload_files", upload.array("files"), uploadFiles)

//generated quiz
app.get('/quiz/:quiz_id', (req, res) => {
    // fs.readFile(path.join(__dirname, 'uploads/test.json'), 'utf8', (err, data) => {
    //     if (err) {
    //         console.error('Error reading the JSON file:', err);
    //         return res.status(500).send('Error loading quiz');
    //     }
    const quiz_id = req.params.quiz_id;
    const quiz_data = `SELECT upload_response FROM quiz WHERE quiz_id = ?`;
    conn.query(quiz_data, [quiz_id], (err, data) => {
        if (err) throw err;
        console.log(`Data Displayed Successfully!`);
    
        if (data.length > 0) {  
            const questions = JSON.parse(data[0].upload_response);
            const answerkey = answers(questions);
            
            console.log(`Data Displayed Successfully! in quiz`);
            res.render("quiz", {
                title: "Quiz",
                action: "list",
                questions: questions,
                answerkey: answerkey
            });
        } else {
            console.log(`No data found for quiz_id: ${quiz_id}`);
            res.status(404).send("Quiz not found");
        }
    });
    


        // const questions = JSON.parse(data);
        // const answerkey = answers(questions);

        // console.log(quiz_data);
        
        // res.render('quiz');
    // });
});

//checker sang score
app.get('/answerkey', (req, res) => {
    const score = req.query.score; 
    fs.readFile(path.join(__dirname, 'uploads/test.json'), 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the JSON file:', err);
            //for server error
            return res.status(500).send('Error loading answer key');
        }
        
        const questions = JSON.parse(data);
        const answerkey = questions.map(q => ({
            question: q.question,
            answer: q.answer 
        }));
        res.render('answerkey', { answerkey, score }); 
    });
});

const answers = (questions) => {
    return questions.map((question) => ({
        question: question.question,
        answer: question.answer 
    }));
};

// medj wala pa ga gana (error: indi automatic ang quiz_id) >.<
app.post('/submit_score', (req, res) => {
    const { quiz_id, user_score } = req.body;
    console.log('Received score submission:', req.body);
    const updated_score = `UPDATE quiz SET user_score = ? WHERE quiz_id = ?`;

    conn.query(updated_score, [user_score, quiz_id], (err, result) => {
        if (err) {
            console.error('Error updating score:', err);
            return res.status(500).send('Error updating score');
        }
        console.log('Score updated successfully', result);
        res.status(200).json({ message: 'Score submitted successfully' });
    });
});

app.listen(3000,()=>{
    console.log("Listening...");
});
