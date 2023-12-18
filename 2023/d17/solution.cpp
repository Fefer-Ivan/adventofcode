#include <iostream>
#include <map>
#include <set>
#include <string>
#include <vector>

using namespace std;

const int N = 200;

const int dx[] = {-1, 0, 1, 0};
const int dy[] = {0, 1, 0, -1};

struct Node {
    int x, y;
    int dir;
    int move_count;

    std::strong_ordering operator<=>(const Node& node) const = default;
};

int n;
int w[N][N];

int dijkstra(Node s) {
    map<Node, int> d;
    d[s] = 0;

    set<pair<int, Node>> q;
    q.emplace(0, s);
    while (!q.empty()) {
        int dv = q.begin()->first;
        Node v = q.begin()->second;
        q.erase(q.begin());

        if (v.x == n - 1 && v.y == n - 1) {
            return dv;
        }

        for (int dir = 0; dir < 4; ++dir) {
            if ((dir + 2) % 4 == v.dir) {
                continue;
            }
            int new_move_count = (v.dir == dir) ? (v.move_count + 1) : 1;
            // part 1
            //if (new_move_count > 3) {
            //    continue;
            //}
            // part 2
            if (new_move_count > 10 || (dir != v.dir && v.move_count < 4)) {
                continue;
            }
            Node u = {v.x + dx[dir], v.y + dy[dir], dir, new_move_count};
            if (u.x < 0 || u.x >= n || u.y < 0 || u.y >= n) {
                continue;
            }
            auto it = d.find(u);
            if (it == d.end() || it->second > dv + w[u.x][u.y]) {
                int& du = d[u];
                q.erase(make_pair(du, u));
                du = dv + w[u.x][u.y];
                q.emplace(du, u);
            }
        }
    }
    throw;
}

int main() {
    int i = 0;
    string line;
    while(cin >> line) {
        n = line.size();
        for (int j = 0; j < n; ++j) {
            w[i][j] = line[j] - '0';
        }
        ++i;
    }

    cout << dijkstra(Node{0, 0, 1, 0}) << std::endl;
    return 0;
}
