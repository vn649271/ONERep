import http from "../http-common";
class UploadFilesService {
  upload(file, prefix, onUploadProgress) {
    let formData = new FormData();
    formData.append("file", file);
    return http.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "prefix": prefix
      },
      onUploadProgress,
    });
  }
  getFiles(userId) {
    return http.get("/files?userId="+userId);
  }
}
export default new UploadFilesService();