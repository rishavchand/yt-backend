
import connectDB from "./db/index.js";
import dotenv from "dotenv";
import { app } from "./app.js";

dotenv.config({
    path: './.env'
})

connectDB()
.then(() => {
    app.on("error", (error) => {
        console.log("Error: ", error);
        throw error;
    })
    app.listen(process.env.PORT || 8000, () => {
        console.log(`app is running on ${process.env.PORT}`)
    })
})
.catch((error) => {
    console.log("MONGODB connection failed !!!")
});














// const app = express();

// ( async () => {
//     try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//     app.on("errror", (error) => {
//             console.log("errr: ", error);
//             throw error;
//     })

//     app.listen(process.env.PORT, ()=>{
//         console.log(`app is listning on ${process.env.PORT}`);

//     })

//     } catch (error) {
//         console.error("Error: ", error);
//         throw error;
//     }
// })()