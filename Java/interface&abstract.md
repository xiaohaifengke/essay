# 接口和抽象类的区别

- 相同点：
  - 都位于继承的顶端，用于被其它类实现或继承；
  - 都不能直接实例化对象；
  - 都包含抽象方法，其子类都必须覆写这些抽象方法。
  
- 区别：
  - 抽象类为部分方法提供实现，避免子类重复实现这些方法，提高代码重用性；接口只能包含抽象方法；
  - 一个类只能继承一个直接父类（可能是抽象类），却可以实现多个接口（接口弥补了Java的单继承）。

- 二者的选用：
  - 优先选用接口，尽量少用抽象类；
  - 需要定义子类的行为，又要为子类提供共性功能时才选用抽象类。
