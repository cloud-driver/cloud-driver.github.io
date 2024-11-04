# 7/15
## if 語法
```cpp=
if 
if...else
```
如果只有一行內容，就不用{}
else會去找最近的if
else if 會按照順序
## switch case 語法
```cpp=
switch(變數){
    case 1:
        ...
        break;
    case 2:
        ...
        break;
    default:
        ...
```
如果沒有break，就會執行之後每一項
## while 語法
```cpp=
while(條件式){
    ...
    ...
}
```
每一次結束的時候才會再判斷要不要執行
## for 迴圈語法
```cpp=
for(初值;條件;更新){
    ...
    ...
}

//ranged base for loop
for(auto i : score){
    ...
    ...
}
```
初值、條件、更新三者可以不一定都要寫，但`;`要留著
初值的那個變數只有在for loop中有用
## 陣列 Array
```cpp=
int fib[10] = {0, 1};
```
如果沒有設定初始值，也就是`{0, 1}`，那麼它就不會清空格子

```cpp=
int n = 0;
cin >> n;
int arr[n];←不一定能這樣寫
```
上面那個東西叫`VLA`，如果真的需要，就放到全域變數

## 時間差計算
```cpp=
#include <iostream>
#include <iomanip>
using namespace std;

int main() {
    int start = 0;
    int end = 0;
    char text[8] = "";
    cin >> text;
    start = (int(text[0]-'0') * 10 + int(text[1]-'0'))*60*60 + (int(text[3]-'0') * 10 + int(text[4]-'0'))*60 + (int(text[6]-'0') * 10 + int(text[7]-'0'));
    char textb[8] = "";
    cin >> textb;
    end = (int(textb[0]-'0') * 10 + int(textb[1]-'0'))*60*60 + (int(textb[3]-'0') * 10 + int(textb[4]-'0'))*60 + (int(textb[6]-'0') * 10 + int(textb[7]-'0'));
    int ans = end - start;
    if (ans < 0){
        ans += 86400;
    }
    int h, m, s;
    h = int(ans/3600);
    ans -= (h*3600);
    m = int(ans/60);
    ans -= (m*60);
    s = ans;
    cout << setfill('0') << setw(2) << h << ':'
         << setfill('0') << setw(2) << m << ':'
         << setfill('0') << setw(2) << s;
    return 0;
}
```
## 成績指標
```cpp=
#include <iostream>
#include <vector>
#include <algorithm>
#include <sstream>

using namespace std;

int main() {
    int people;
    cin >> people;

    vector<int> score(people);
    for (int i = 0; i < people; ++i) {
        cin >> score[i];
    }

    vector<int> PassScore;
    vector<int> FailScore;

    for (int i = 0; i < people; ++i) {
        if (score[i] >= 60) {
            PassScore.push_back(score[i]);
        } else {
            FailScore.push_back(score[i]);
        }
    }

    sort(score.begin(), score.end());

    for (int i = 0; i < score.size(); ++i) {
        cout << score[i];
        if (i != score.size() - 1) {
            cout << " ";
        }
    }
    cout << endl;

    if (!FailScore.empty()) {
        cout << *max_element(FailScore.begin(), FailScore.end()) << endl;
    } else {
        cout << "best case" << endl;
    }

    if (!PassScore.empty()) {
        cout << *min_element(PassScore.begin(), PassScore.end()) << endl;
    } else {
        cout << "worst case" << endl;
    }

    return 0;
}
```
## 雪花片片
```py=
print(((4 * (4**(int(input())-1) - 1)) // 3 ) + 1)
```
```cpp=
#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

using namespace std;

int main() {
    int N;
    cin >> N;

    string total = "1";  // 初始化总和，从 N = 1 开始
    string current_triangles = "1";  // N = 1 时的三角形数

    for (int i = 1; i < N; i++) {
        // 处理大数乘以 4
        string temp = "";
        int carry = 0;
        for (int j = current_triangles.size() - 1; j >= 0; --j) {
            int n = (current_triangles[j] - '0') * 4 + carry;
            temp.push_back((n % 10) + '0');
            carry = n / 10;
        }
        if (carry > 0) {
            temp.push_back(carry + '0');
        }
        reverse(temp.begin(), temp.end());
        current_triangles = temp;

        // 处理大数加法
        string sumResult = "";
        carry = 0;
        int size1 = total.size();
        int size2 = current_triangles.size();
        int max_size = max(size1, size2);
        for (int k = 0; k < max_size; k++) {
            int n1 = k < size1 ? total[size1 - 1 - k] - '0' : 0;
            int n2 = k < size2 ? current_triangles[size2 - 1 - k] - '0' : 0;
            int sum = n1 + n2 + carry;
            sumResult.push_back((sum % 10) + '0');
            carry = sum / 10;
        }
        if (carry > 0) {
            sumResult.push_back(carry + '0');
        }
        reverse(sumResult.begin(), sumResult.end());
        total = sumResult;
    }

    cout << total << endl;
    return 0;
}
```
```cpp=
#include <iostream>
#include <vector>
#include <cstring>

using namespace std;

void pow(int i, vector<int>& temp, int ca){ 
    if (i >= temp.size() && ca == 0) return;
    if (i >= temp.size()) temp.push_back(0);

    temp[i] *= 4;
    temp[i] += ca;
    ca = temp[i] / 10;
    temp[i] = temp[i] % 10;

    pow(i + 1, temp, ca);
}

void add(int i, vector<int>& num, vector<int>& temp, int ca){
    if (i >= num.size() && i >= temp.size() && ca == 0) return;
    if (i >= num.size()) num.push_back(0);
    if (i >= temp.size()) temp.push_back(0);

    num[i] += temp[i] + ca;
    ca = num[i] / 10;
    num[i] = num[i] % 10;

    add(i + 1, num, temp, ca);
}

int main() {
    int n;
    cin >> n;

    vector<int> num(1, 1);
    vector<int> temp(1, 1);

    if(n == 1){
        cout << "1" << endl;
    }else{
        for(int i = 0; i < n - 1; i++){
            pow(0, temp, 0);
            add(0, num, temp, 0);
        }
    }

    bool leadingZero = true;
    for(int i = num.size() - 1; i >= 0; i--){
        if(num[i] != 0) leadingZero = false;
        if(!leadingZero) cout << num[i];
    }
    if (leadingZero) cout << "0";

    cout << endl;
    return 0;
}
```
## 找出最小的完全平方數
```cpp=
#include <iostream>
#include <cmath>
using namespace std;

bool all(long long n) {
    while (n > 0) {
        int digit = n % 10;
        if (digit % 2 != 0) {
            return false;
        }
        n /= 10;
    }
    return true;
}


long long find(int k) {
    long long start = ceil(sqrt(pow(10, k - 1)));
    long long end = sqrt(pow(10, k) - 1);
    
    for (long long i = start; i <= end; ++i) {
        long long square = i * i;
        if (to_string(square).length() == k && all(square)) {
            return square;
        }
    }
    
    return -1;
}

int main() {
    int n, k;
    cin >> n;
    
    for (int i = 0; i < n; i++) {
        cin >> k;
        cout << find(k) << endl;
    }

    return 0;
}

```
## 一起回家過日子
```cpp=
#include <iostream>
#include <vector>
#include <iomanip>

using namespace std;

bool isLeapYear(int year) {
    if (year % 4 == 0) {
        if (year % 100 == 0) {
            if (year % 400 == 0) {
                return true;
            }
            return false;
        }
        return true;
    }
    return false;
}

int md(int year, int month) {
    switch (month) {
        case 4: case 6: case 9: case 11:
            return 30;
        case 2:
            return isLeapYear(year) ? 29 : 28;
        default:
            return 31;
    }
}

int gcd(int a, int b) {
    while (b != 0) {
        int r = a % b;
        a = b;
        b = r;
    }
    return a;
}

int lcm(int i, int a, const vector<int>& num) {
    if (num.size() == 0) return 0;
    if (i == num.size() - 1) {
        return (a / gcd(a, num[i])) * num[i];
    } else {
        int next_a = (a / gcd(a, num[i])) * num[i];
        return lcm(i + 1, next_a, num);
    }
}

int main() {
    int n = 0, days = 0;
    cin >> n;
    vector<int> num(n);
    for(int i = 0; i < n; i++){
        cin >> num[i];
    }
    days = lcm(0, 1, num);
    int y, m, d;
    char slash;
    cin >> y >> slash >> m >> slash >> d;
    int startmd = md(y, m);
    while (days > 0) {
        if (d + days > startmd) {
            days -= (startmd - d + 1);
            d = 1;
            if (m == 12) {
                m = 1;
                y++;
            } else {
                m++;
            }
            startmd = md(y, m);
        } else {
            d += days;
            days = 0;
        }
    }
    cout << setfill('0') << setw(4) << y << "/"
         << setfill('0') << setw(2) << m << "/"
         << setfill('0') << setw(2) << d << endl;
    return 0;
}
```

## 賓果遊戲
```cpp=
#include <iostream>
#include <vector>
using namespace std;

vector<vector<int>> num(5, vector<int>(5, 0));
vector<vector<int>> ma(5, vector<int>(5, -1));

int check(int x, int y){
    int point_x = 1, point_y = 1, point_r = 1, point_r2 = 1, re = 0;
    for(int i = 0; i < 5; i++){
        if(ma[x][i] != -1){
            point_x += 1;
        }
        if(ma[i][y] != -1){
            point_y += 1;
        }
        if(ma[i][i] != -1){
            point_r += 1;
        }
        if(ma[i][4-i] != -1){
            point_r2 += 1;
        }
    }
    re += (point_x == 5) ? 1 : 0;
    re += (point_y == 5) ? 1 : 0;
    re += (x == y && point_r == 5) ? 1 : 0;
    re += (x + y == 4 && point_r2 == 5) ? 1 : 0;
    return re;
}

int main() {
    for (int i = 0; i < num.size(); i++) { 
        for (int j = 0; j < num[i].size(); j++) { 
            cin >> num[i][j]; 
        }
    }
    int n = 0, ans_n = 100000000, ans_p = 0;
    while(cin >> n){
        if(n == -1){
            break;
        }
        bool marked = false;
        for (int i = 0; i < num.size(); i++) { 
            for (int j = 0; j < num[i].size(); j++) { 
                if(num[i][j] == n){
                    ma[i][j] = n;
                    marked = true;
                    break;
                }
            }
            if(marked) break;
        }
    }
    for (int i = 0; i < num.size(); i++) { 
        for (int j = 0; j < num[i].size(); j++) { 
            if(ma[i][j] != -1){
                continue;
            } else {
                int point = check(i, j);
                if(point > ans_p || (point == ans_p && num[i][j] < ans_n)){
                    ans_p = point;
                    ans_n = num[i][j];
                }
            }
        }
    }
    cout << ans_n << endl;
    return 0;
}
```