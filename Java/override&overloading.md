重写只存在于子类与父类中，重载存在于一个类中。

具体区别如下：

一、重写（override）

override是重写（覆盖）了一个方法，以实现不同的功能。一般是用于子类在继承父类时，重写（重新实现）父类中的方法。

重写（覆盖）的规则：

1、重写方法的参数列表必须完全与被重写的方法的相同,否则不能称其为重写而是重载.

2、重写方法的访问修饰符一定要大于被重写方法的访问修饰符（public>protected>default>private）。

3、重写的方法的返回值必须和被重写的方法的返回一致；

4、重写的方法所抛出的异常必须和被重写方法的所抛出的异常一致，或者是其子类；

5、被重写的方法不能为private，否则在其子类中只是新定义了一个方法，并没s有对其进行重写。

6、静态方法不能被重写为非静态的方法（会编译出错）。

二、overload是重载，一般是用于在一个类内实现若干重载的方法，这些方法的名称相同而参数形式不同。

重载的规则：

1、在使用重载时只能通过相同的方法名、不同的参数形式实现。不同的参数类型可以是不同的参数类型，不同的参数个数，不同的参数顺序（参数类型必须不一样）；

2、不能通过访问权限、返回类型、抛出的异常进行重载；

3、方法的异常类型和数目不会对重载造成影响；

多态的概念比较复杂，有多种意义的多态，一个有趣但不严谨的说法是：继承是子类使用父类的方法，而多态则是父类使用子类的方法。

一般，我们使用多态是为了避免在父类里大量重载引起代码臃肿且难于维护。

继承是子类获得父类的成员，重写是继承后重新实现父类的方法。重载是在一个类里一系列参数不同名字相同的方法。多态则是用基类的引用指向子类的对象。

        网上看到一个有趣的说法是：继承是子类使用父类的方法，而多态则是父类使用子类的方法。

下面的例子包含了这四种实现：

    //Triangle 继承Shape类

class Triangle extends Shape {

    //重写Shape类中的getSides方法

      public int getSides() {

            return 3;

      }

}

    //Rectangle 继承Shape类

class Rectangle extends Shape {

    //重载Shape类中的getSides方法（在父类中getSide方法中添加了参数）

      public int getSides(int i) {

            return i;

      }

}

    //父类

public class Shape {

      public boolean isSharp(){

            return true;

      }

      public int getSides(){

            return 0 ;

      }

      public int getSides(Triangle tri){

            return 3 ;

      }

      public int getSides(Rectangle rec){

            return 4 ;

      }

    public static void main(String[] args) {

            Triangle tri = new Triangle();

            System.out.println("Triangle is a type of sharp? " + tri.isSharp());

            //isShape()为父类中的方法，Triangle中没有，所以tri.isSharp()方法为继承父类中的方法

            Shape shape = new Triangle();

            //new一个对象为Triangle的Shape实例（和new一个对象为dog的animal实例一样理解）

            //此为父类的多态

            System.out.println("My shape has " + shape.getSides() + " sides.");

      }

}

比较就可以发现多态对重载的优点：如果用重载，则在父类里要对应每一个子类都重载一个取得边数的方法；如果用多态，则父类只提供取得边数的接口，至于取得哪个形状的边数，怎样取得，在子类里各自实现(重写)

作者：codingcc
链接：https://www.jianshu.com/p/c69aa573b93f
来源：简书
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
