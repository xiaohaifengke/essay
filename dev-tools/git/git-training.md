# Git Summary

> git的特性及与svn的区别
>
> git中工作区
>
> 常用命令
>
> 分支及merge
>
> 其它：1: 常用的git工具

1. 常用的git命令

2. git branch

3. git workflow

4. .gitignore

5. git三板斧

6. git fetch

7. `git stash` 是程序员的至宝

   > 老板 biangbiang 甩来一个 case，说这个要下班之前 hot fix，咋办，stash，切到 release 对应的分支，缝缝补补；产品 kuangkuang 砸来一个需求更新，说这个简单，小哥哥帮帮我先做了，咋办，stash 切一个新的 feature 分支，撸袖子干。如果没有 `git stash`，人生至少要灰暗一半。

8. 查看当前状态 *git* status

9. 不在跟踪已经提交过的文件，用什么命令？

10. 只要commit过的内容，就都可以找回

11. rebase

12. 只合并某个分支的个别文件

13. 只合并某次提交内容



>  因为时间有限，所以这次分享主要以能快速上手git，能应对常见场景的使用需求为目的。对于有基础的小伙伴来说可能不够深入，如果有想讨论的，可以随时提出来。
>
>  在坐的这么多同事，我相信肯定有一些人的git用的很好的，所以如果发现我讲错了，要及时纠正，千万不能因为我的理解偏差把大伙带偏了。如果有某方面没涉及到或者没讲清楚的，及时提出来，可以深入沟通。
>
>  时间有限，我把我工作中感觉重要的命令和场景跟大家分享下。

## 1.SVN与Git的最主要的区别？

SVN是集中式版本控制系统，版本库是集中放在中央服务器的，而干活的时候，用的都是自己的电脑，所以首先要从中央服务器哪里得到最新的版本，然后干活，干完后，需要把自己做完的活推送到中央服务器。~~集中式版本控制系统的中央服务器是必须的，而且是必须联网才能工作，如果在局域网还可以，带宽够大，速度够快，如果在互联网下，如果网速慢的话，就纳闷了。~~

Git是分布式版本控制系统，那么它就可以是没有中央服务器的（为了团队间协作方便，通常也会有中央服务器），每个人的电脑就是一个完整的版本库，这样，工作的时候就不需要联网了，因为版本都是在自己的电脑上。既然每个人的电脑都有一个完整的版本库，那多个人如何协作呢？~~比如说自己在电脑上改了文件A，其他人也在电脑上改了文件A，这时，你们两之间只需把各自的修改推送给对方，就可以互相看到对方的修改了。~~

> Git不需要联网的体现：在中央仓库未建立时即可进行版本控制，这个是svn做不到的。
>
> 那为什么还要加上中央仓库？1. 方便团队协作  2. 代码存储/备份
>
> 当然，Git的优势不单是不必联网这么简单，后面我们还会看到Git极其强大的分支管理，把SVN等远远抛在了后面。
>
> Git的劣势：上手比较难。不适合大文件存储，如镜像文件，大psd等。

## 2. 必须掌握的重要概念

从Git三板斧开始说起。应该是所有的使用过git的人都知道提交代码通常需要最基本的三步：`git add .` `git commit -m "xxx"` `git push/git pull`，那为什么提交个代码要操作三次呢，好像很麻烦的样子？

### 2.1 五个工作区域

![git-axiom](./git-workspace.png)

- `Workspace`：工作区
- `Index / Stage`：暂存区
- `Repository`：仓库区（或本地仓库）
- `Remote`：远程仓库
- `Stash`：储藏区（Git的存储栈）

### 2.2 工作流程

git的工作流程一般是这样的：

１、在工作目录中添加、修改文件；

２、将需要进行版本管理的文件放入暂存区域；(`git add <file>...`)

３、将暂存区域的文件提交到git本地仓库。(`git commit -m "message..."`)

因此，git管理的文件有三种状态：已修改（modified）,已暂存（staged）,已提交(committed)

### 2.3 文件的四种状态

版本控制就是对文件的版本控制，要对文件进行修改、提交等操作，首先要知道文件当前在什么状态，不然可能会提交了现在还不想提交的文件，或者要提交的文件没提交上。

GIT不关心文件两个版本之间的具体差别，而是关心文件的整体是否有改变，若文件被改变，在添加提交时就生成文件新版本的快照，而判断文件整体是否改变的方法就是用：SHA-1算法计算文件的校验和。

![file-status](./file-status.png)

**Untracked:**  未跟踪, 此文件在文件夹中, 但并没有加入到git库, 不参与版本控制. 通过git add 状态变为Staged.

**Unmodify:**  文件已经入库, 未修改, 即版本库中的文件快照内容与文件夹中完全一致. 这种类型的文件有两种去处, 如果它被修改, 而变为Modified.如果使用git rm移出版本库, 则成为Untracked文件

**Modified:** 文件已修改, 仅仅是修改, 并没有进行其他的操作. 这个文件也有两个去处, 通过git add可进入暂存staged状态, 使用git checkout 则丢弃修改过,返回到unmodify状态, 这个git checkout即从库中取出文件, 覆盖当前修改

**Staged:** 暂存状态. 执行git commit则将修改同步到本地仓库中, 这时库中的文件和本地文件又变为一致, 文件为Unmodify状态. 执行git reset HEAD filename取消暂存,文件状态为Modified

> git中的HEAD是什么？

下面的图很好的解释了这四种状态的转变：

![file-status-change.png](./file-status-change.png)

新建文件--->Untracked

使用add命令将新建的文件加入到暂存区--->Staged

使用commit命令将暂存区的文件提交到本地仓库--->Unmodified

如果对Unmodified状态的文件进行修改---> modified

如果对Unmodified状态的文件进行remove操作--->Untracked

## 3. Git 常用命令

```
# 查看工作区和暂存区的状态
git status 
# 将工作区的文件提交到暂存区
git add .  
# 提交到本地仓库
git commit -m "本次提交说明"
# add和commit的合并，便捷写法（未追踪的文件无法直接提交到暂存区/本地仓库）
git commit -am "本次提交说明"  
# 将本地分支和远程分支进行关联
git push -u origin branchName 
# 将本地仓库的文件推送到远程分支
git push
# 拉取远程分支的代码
git pull origin branchName 
# 合并分支
git merge branchName 
# 查看本地拥有哪些分支
git branch
# 查看所有分支（包括远程分支和本地分支）
git branch -a 
# 切换分支
git checkout branchName 
# 临时将工作区文件的修改保存至堆栈中
git stash
# 将之前保存至堆栈中的文件取出来
git stash pop
# 查看提交历史
git log
```

## 4. 五个区域常用命令

###   4.1 新建代码库

```
# 在当前目录新建一个Git代码库
 git init
# 新建一个目录，将其初始化为Git代码库
git init [project-name]
# 下载一个项目和它的整个代码历史
git clone [url]
```

### 4.2 查看文件状态

```
#查看所有文件状态
git status
#查看指定文件状态
git status [filename]
```

### 4.3 工作区<-->暂存区

```
# 添加指定文件到暂存区
git add [file1] [file2] ...
# 添加指定目录到暂存区，包括子目录
git add [dir]
# 添加当前目录的所有文件到暂存区
git add .
#只作用于工作区已经跟踪的文件变更
git add -u
#当我们需要删除暂存区或分支上的文件, 同时工作区也不需要这个文件了, 可以使用（⚠️）
git rm file_path
#当我们需要删除暂存区或分支上的文件, 但本地又需要使用, 这个时候直接push那边这个文件就没有，如果push之前重新add那么还是会有。
git rm --cached file_path
#直接加文件名   从暂存区将文件恢复到工作区，如果工作区已经有该文件，则会选择覆盖
#加了【分支名】 +文件名  则表示从分支名为所写的分支名中拉取文件 并覆盖工作区里的文件
git checkout
```

### 4.4 工作区<-->本地仓库

```
#将暂存区的文件提交到本地仓库并添加提交说明
git commit -m '该次提交说明'
# add 和 commit 的合并，便捷写法
# 和 git add -u 命令一样，未跟踪的文件是无法提交上去的
$ git commit -am "本次提交的说明"
#如果出现:将不必要的文件commit 或者 上次提交觉得是错的  或者 不想改变暂存区内容，只是想调整提交的信息
#移除不必要的添加到暂存区的文件
git reset HEAD 文件名
#去掉上一次的提交（会直接变成add之前状态）   
git reset HEAD^ 
#去掉上一次的提交（变成add之后，commit之前状态） 
git reset --soft  HEAD^ 
```

### 4.5 远程操作

```
# 取回远程仓库的变化，并与本地分支合并
git pull
# 拉取指定的远程分支的代码
git pull origin branchName
# 上传本地指定分支到远程仓库
git push [ origin master[:master]]
# 将本地分支和远程分支进行关联(通常仅在第一次提交时)
git push -u origin branchName
```

### 4.6 工作区<-->储藏区

```
# 将所有未commit的修改保存至堆栈中
$ git stash 
# 给本次存储加个备注，以防时间久了忘了
$ git stash save "存储"
# 存储未追踪的文件
$ git stash -u

# 查看存储记录
$ git stash list

在 Windows 上和 PowerShell 中，需要加双引号
# 恢复后，stash 记录并不删除
$ git stash apply "stash@{index}"
# 恢复的同时把 stash 记录也删了
$ git stash pop "stash@{index}"
# 删除 stash 记录
$ git stash drop "stash@{index}"
# 删除所有存储的进度
$ git stash clear
# 查看当前记录中修改了哪些文件
$ git stash show "stash@{index}"
# 查看当前记录中修改了哪些文件的内容
$ git stash show -p "stash@{index}" 
```

### 4.7 其它常用命令

```

#初次commit之前，需要配置用户邮箱及用户名，使用以下命令：
git config --global user.email "you@example.com"
git config --global user.name "Your Name"
# 查看本地拥有哪些分支
git branch
# 查看所有分支（包括远程分支和本地分支）
git branch -a 
# 切换分支
git checkout branchName 
# 创建新分支并切换到该新分支
git checkout -b branchName 
# 临时将工作区文件的修改保存至堆栈中
git stash
# 将之前保存至堆栈中的文件取出来
git stash pop


# 显示当前的Git配置
git config --list
# 编辑Git配置文件
git config -e [--global]
#调出Git的帮助文档
git --help
#查看某个具体命令的帮助文档
git +命令 --help
#查看git的版本
git --version
```

## 5. Git 命令专题



## 6. 工作中常见问题的解决方式

## 7. 使用GitLab

