import http from 'k6/http';

export default function () {
    http.get("http://productpage:9080");
}