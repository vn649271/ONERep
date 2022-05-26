import http from "../http-common";
class UsersService {
  getUsers() {
    return http.get("/users");
  }
  addUser(data) {
    return http.post("/addUser", data);
  }
}
export default new UsersService();