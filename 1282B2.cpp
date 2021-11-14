#include <bits/stdc++.h>
#define ll long long
#define int ll
#define count_one(a) __builtin_popcountll(a)
#define power_2(a) (a) & (a - 1) == 0
#define vv vector<vector<int>>
#define exit return 0
const double eps = 1e-10;
const double pi = acos(-1.0);
#define IOS                                                                    \
    ios_base::sync_with_stdio(false);                                          \
    cin.tie(NULL);
using namespace std;
void dbg_out() {
    cout << endl;
}
template <typename Head, typename... Tail> void dbg_out(Head H, Tail... T) {
    cout << ' ' << H;
    dbg_out(T...);
}
#ifndef ONLINE_JUDGE
#define dbg(...)                                                               \
    cout << "(" << #__VA_ARGS__ << "):", dbg_out(__VA_ARGS__), cout << endl
#else
#define dbg(...)
#endif

// test

int32_t main() {
    IOS;
    return 0;
}
