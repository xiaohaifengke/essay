# Java开发中遇到的问题

## 注解相关
1. @responseBody的使用
   ​	@ResponseBody注解的作用是将controller的方法返回的对象通过适当的转换器转换为指定的格式之后，写入到response对象的body区，通常用来返回JSON数据或者是XML数据，需要注意的呢，在使用此注解之后不会再走视图处理器，而是直接将数据写入到输入流中，他的效果等同于通过response对象输出指定格式的数据。

   > ```java
   > 　@RequestMapping("/login")
   > 　@ResponseBody
   > 　public User login(User user){
   >       return user;
   > 　}
   > ```
   >
   > ##### User字段：userName pwd 那么在前台接收到的数据为：'{"userName":"xxx","pwd":"xxx"}'
   >
   > ##### 效果等同于如下代码：
   >
   > ```java
   > @RequestMapping("/login")
   > public void login(User user, HttpServletResponse response){
   >     response.getWriter.write(JSONObject.fromObject(user).toString());
   > }
   > ```
   >

2. @RequestParam注解使用

   1、作用：

   > GET和POST请求传的参数会自动转换赋值到@RequestParam 所注解的变量上
   >
   > @RequestParam（org.springframework.web.bind.annotation.RequestParam）用于将指定的请求参数赋值给方法中的形参。

   2、语法：

   > 语法：@RequestParam(value=”参数名”,required=”true/false”,defaultValue=””)
   >
   > value：参数名
   >
   > required：是否包含该参数，默认为true，表示该请求路径中必须包含该参数，如果不包含就报错。
   >
   > defaultValue：默认参数值，如果设置了该值，required=true将失效，自动为false,如果没有传该参数，就使用默认值

   3、GET请求：

   也可以不使用@RequestParam，直接接收，此时要求controller方法中的参数名称要跟form中name名称一致

   总结：（接收请求参数的方式）

   ```java
   @RequestParam(value="username") String userName, @RequestParam(value="usernick") String userNick //value中的参数名称要跟name中参数名称一致
   String username, String usernick// 此时要参数名称一致
   HttpServletRequest request //request.getParameter("usernick")
   ```

   4、POST请求：

   跟get请求格式一样，只是把方法中的get换成post

   @RequestParam
   用来处理Content-Type: 为 application/x-www-form-urlencoded编码的内容。提交方式为get或post。（Http协议中，如果不指定Content-Type，则默认传递的参数就是application/x-www-form-urlencoded类型）

   RequestParam实质是将Request.getParameter() 中的Key-Value参数Map利用Spring的转化机制ConversionService配置，转化成参数接收对象或字段。

   get方式中query String的值，和post方式中body data的值都会被Servlet接受到并转化到Request.getParameter()参数集中，所以@RequestParam可以获取的到。

3. @RequestBody

   @RequestBody注解可以接收json格式的数据，并将其转换成对应的数据类型。

   @RequestBody
   处理HttpEntity传递过来的数据，一般用来处理非Content-Type: application/x-www-form-urlencoded编码格式的数据。

   GET请求中，因为没有HttpEntity，所以@RequestBody并不适用。
   POST请求中，通过HttpEntity传递的参数，必须要在请求头中声明数据的类型Content-Type，SpringMVC通过使用HandlerAdapter 配置的HttpMessageConverters来解析HttpEntity中的数据，然后绑定到相应的bean上。

   @RequestBody用于post请求，不能用于get请求

   这里涉及到使用@RequestBody接收不同的对象

   1. 创建一个新的entity，将两个entity都进去。这是最简单的，但是不够“优雅”。
   2. 用Map<String, Object>接受request body，自己反序列化到各个entity中。
   3. 类似方法2，不过更为generic，实现自己的HandlerMethodArgumentResolver。参考[这里 ](https://sdqali.in/blog/2016/01/29/using-custom-arguments-in-spring-mvc-controllers/)

4. @ModelAttribute（暂时用不到，简略记录）

   @ModelAttribute注解类型将参数绑定到Model对象

   注解在参数上，会将客户端传递过来的参数按名称注入到指定对象中，并且会将这个对象自动加入ModelMap中；
   注解在方法上，会在每一个@RequestMapping标注的方法前执行，如果有返回值，则自动将该返回值加入到ModelMap中；

5. @Slf4j

   @Slf4j是用作日志输出的，一般会在项目每个类的开头加入该注解，如果不写下面这段代码，并且想用log

   ```java
   private final Logger logger = LoggerFactory.getLogger(当前类名.class);
   ```

   就可以用@Slf4来代替;这样就省去这段很长的代码。

   ```java
   import ...
   
   @Controller
   @RequestMapping("/abc")
   @Slf4j
   public class QueryBillController {
       @Autowired
       private TraceService traceService;
       @Autowired
       private SignatureAndVerification signatureAndVerification;
   
       /**
        * 账单查询接口
        */
       @RequestMapping(.........)
       @ResponseBody
       public String getBills(@RequestBody String queryRequest) {
           log.info("进入账单查询接口");
           // ....
       }
   }
   ```

6. @Valid

   ​	用于验证参数是否符合要求，直接加在变量user之前，在变量中添加验证信息的要求，当不符合要求时就会在方法中返回message 的错误提示信息。

   ```java
   @RestController
   @RequestMapping("/user")
   public class UserController {
       @PostMapping
       public User create (@Valid @RequestBody User user) {
           System.out.println(user.getId());
           System.out.println(user.getUsername());
           System.out.println(user.getPassword());
           user.setId("1");
           return user;
       }
   }
   ```

   ​	然后在 User 类中添加验证信息的要求：

   ```java
   
   ```

   ​	@NotBlank 注解所指的 password 字段，表示验证密码不能为空，如果为空的话，上面 Controller 中的 create 方法会将message 中的"密码不能为空"返回。

   当然也可以添加其他验证信息的要求：

   | 限制                      | 说明                                                         |
   | ------------------------- | ------------------------------------------------------------ |
   | @Null                     | 限制只能为null                                               |
   | @NotNull                  | 限制必须不为null                                             |
   | @AssertFalse              | 限制必须为false                                              |
   | @AssertTrue               | 限制必须为true                                               |
   | @DecimalMax(value)        | 限制必须为一个不大于指定值的数字                             |
   | @DecimalMin(value)        | 限制必须为一个不小于指定值的数字                             |
   | @Digits(integer,fraction) | 限制必须为一个小数，且整数部分的位数不能超过integer，小数部分的位数不能超过fraction |
   | @Future                   | 限制必须是一个将来的日期                                     |
   | @Max(value)               | 限制必须为一个不大于指定值的数字                             |
   | @Min(value)               | 限制必须为一个不小于指定值的数字                             |
   | @Past                     | 限制必须是一个过去的日期                                     |
   | @Pattern(value)           | 限制必须符合指定的正则表达式                                 |
   | @Size(max,min)            | 限制字符长度必须在min到max之间                               |
   | @Past                     | 验证注解的元素值（日期类型）比当前时间早                     |
   | @NotEmpty                 | 验证注解的元素值不为null且不为空（字符串长度不为0、集合大小不为0） |
   | @NotBlank                 | 验证注解的元素值不为空（不为null、去除首位空格后长度为0），不同于@NotEmpty，@NotBlank只应用于字符串且在比较时会去除字符串的空格 |
   | @Email                    | 验证注解的元素值是Email，也可以通过正则表达式和flag指定自定义的email格式 |

   除此之外还可以自定义验证信息的要求，例如下面的 @MyConstraint：

   ```java
   public class User {
    
       private String id;
    
       @MyConstraint(message = "这是一个测试")
       private String username;
    
   }
   ```

   注解的具体内容：

   ```java
   @Constraint(validatedBy = {MyConstraintValidator.class})
   @Target({ELementtype.METHOD, ElementType.FIELD})
   @Retention(RetentionPolicy.RUNTIME)
   public @interface MyConstraint {
       String message();
       Class<?>[] groups() default {};
       Class<? extends Payload>[] payload() default {}; 
   }
   ```

   下面是校验器：

   ```java
   public class MyConstraintValidator implements ConstraintValidator<MyConstraint, Object> {
       @Autowired
       private UserService userService;
       
       @Override
       public void initialie(@MyConstraint constarintAnnotation) {
           System.out.println("my validator init");
       }
       
       @Override
       public boolean isValid(Object value, ConstraintValidatorContext context) {
           userService.getUserByUsername("seina");
           System.out.println("valid");
           return false;
       }
   }
   ```



## 其它