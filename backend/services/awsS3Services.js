const AWS = require('aws-sdk');

exports.uploadToS3 = (data,fileName) => {
    const bucketName = process.env.BUCKET_NAME;
    const iamAccessKey = process.env.IAM_ACCESS_KEY;
    const iamAccessSecret = process.env.IAM_ACCESS_SECRET;

    const s3Bucket = new AWS.S3({
        accessKeyId:iamAccessKey,
        secretAccessKey:iamAccessSecret
    });

    const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: data,
        ACL: 'public-read'
    };

    return new Promise((resolve,reject) => {
        s3Bucket.upload(params,(err,s3Response) => {
            if(err){
                console.log("S3 Upload Errror")
                reject(err);
                return;
            }
            resolve(s3Response.Location);
        })
    })
}