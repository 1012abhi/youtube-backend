import multer from "multer";

// ham yaha par diskstorage use kr rahe hai memorystorage isliye nahi kr rahe hai kyuki memory jyada bada data aa gya to problem ho jayegi

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/temp")
    },
    filename: function (req, file, cb) {
      
      cb(null, file.originalname)
    }
  })
  
  export const upload = multer({ 
    storage, 
})
