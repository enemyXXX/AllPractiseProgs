class Boid {
  constructor() {	/*Конструктор объектов*/
    this.position = createVector(random(width), random(height));	/*задаём положение на холсте*/
    this.velocity = p5.Vector.random2D();	/*Свойство, отвечающее за направление движения объекта*/
    this.acceleration = createVector();	/*Свойство, отвечающее за ускорение объекта*/
    this.maxForce = 1;	/*Свойство, отвечающее за максимальную скорость толчка объекта*/
    this.maxSpeed = random(2,4);	/*Свойство, отвечающее за максимальную скорость объекта*/
  }

  edges() {		/*Проверка выхода за одну из границ холста*/
    if (this.position.x > width) { 	/*Если объект по координате X выходит за правый край - его положение по оси X обнуляется*/
      this.position.x = 0;
    } else if (this.position.x < 0) {	/*Если положение по оси X меньше 0 - его положение по оси X становится равным значению правого края холста*/
      this.position.x = width;
    }
    if (this.position.y > height) {	/*Если положение по оси Y выходит за нижний край холста - положение по оси Y обнуляется*/
      this.position.y = 0;
    } else if (this.position.y < 0) { /*Если положение по оси Y меньше 0 - положение по оси Y становится максимальным*/
      this.position.y = height;
    }
  }

  align(boids) { 			/*Первое правило для каждого объекта: Необходимо двигаться в направлении среднего курса объектов рядом с ним*/
    var perceptionRadius = 100;	/*Свойство, отвечающее за радиус, в котором происходит проверка направления*/
    var steering = createVector();	/*Переменная, в которую складываются все направления ближайших объектов*/
    var total = 0;	/*Количество объектов в радиусе данного объекта*/

    for (var other of boids) {	/*Проверяем каждый объект по порядку*/
      var d = dist(this.position.x, this.position.y, other.position.x, other.position.y);	
      /*Переменная d отвечает за расстояние между этим объектов до другого*/
      if (other != this && d < perceptionRadius) {	/*Если расстояние меньше чем радиус проверки и проверяемый объект не равен текущему*/
        steering.add(other.velocity);	/*Складываем направление движения объекта */
        total++;	/*Увеличиваем количество объектов в радиусе срабатывания правила на 1*/
      }
    }
    if (total > 0) {	/*Если в радиусе с объектом находится хотя бы 1 объект*/
      steering.div(total);	/*Делим сумму всех направлений на количество объектов*/
      steering.setMag(this.maxSpeed);	/*Ускорение объекта */
      steering.sub(this.velocity);	/*Отнимаем от суммы всех направлений текущее направление*/
      steering.limit(this.maxForce);	/*Ограничиваем скорость объекта*/
    }
    return steering;	/*Значение скорости полученной из первого правила*/
  }

  separation(boids) {	/*Второе правило для каждого объекта: среднее направление от всех ближайших юнитов*/
    var perceptionRadius = 100;	/*Радиус срабатывания правила*/
    var steering = createVector();
    var total = 0;	/*Количество объектов в радиусе правила*/
    for (var other of boids) {
      var d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      /*Если объект в зоне срабатывания правила - выполняем следующую проверку*/
      if (other != this && d < perceptionRadius) {	/*Если объект не равен данному тогда*/
        var diff = p5.Vector.sub(this.position, other.position);	/*Отнимаем от текущего положения положение другого объекта. То есть 
        переносим в переменную diff - обратное положение относительно другого объекта*/
        diff.div(d * d);	/*Делим положение на квадрат растояния*/
        steering.add(diff);	/*Складываем получившееся значение*/
        total++;	/*Увеличиваем количество объектов рядом с текущим*/
      }
    }
    if (total > 0) {	/*Если с объектом находится хотя-бы 1 объект*/
      steering.div(total);	/*Находим среднее арифметическое значение*/
      steering.setMag(this.maxSpeed);	/*Умножаем его на скорость*/
      steering.sub(this.velocity);	/*Отнимаем направление*/
      steering.limit(this.maxForce);	/*И ограничиваем получившуюся скорость*/
    }
    return steering;	/*Возвращаем получившееся значение скорость из второго правила*/
  }

  cohesion(boids) {	/*Третье правило для каждого объекта: среднее арифметическое координат всех юнитов*/
    var perceptionRadius = 100;	/*Радиус срабатывания правила*/
    var steering = createVector();	/*Переменная, которая хранит сумму всех позиций объектов в радиусе срабатывания правила*/
    var total = 0;	/*Количество объектов в радиусе срабатывания правила*/
    for (var other of boids) {
      var d = dist(this.position.x, this.position.y, other.position.x, other.position.y);
      if (other != this && d < perceptionRadius) {
        steering.add(other.position);
        total++;
      }	/*Дублируем проверку из первого правила, но вместо направления складываем позицию*/
    }
    if (total > 0) {	/*Если объект находится рядом хотя бы с 1 объектом*/
      steering.div(total); /*Находим среднее арифметическое значение позиции*/
      steering.sub(this.position);	/*Отнимаем от него текущее положение*/
      steering.setMag(this.maxSpeed);	/*Ускоряем объект*/
      steering.sub(this.velocity);	/*Отнимаем текущее направление*/
      steering.limit(this.maxForce);	/*Ограничиваем получившееся значение скорости*/
    }	
    return steering;	/*Возвращаем значение скорости полученное в третьем правиле*/
  }

  flock(boids) {
    var alignment = this.align(boids);	/*Значение скорости полученного из первого правила (движение в одном направлении)*/
    var cohesion = this.cohesion(boids);	/*Значение скорости полученного из второго правила (сплоченность)*/
    var separation = this.separation(boids); /*Значение скорости полученного из третьего правила (Разделение движения)*/

    cohesion.mult(cohesionSlider.value());	/*Умножаем значение сплоченности на значение слайдера*/

    this.acceleration.add(alignment);	/*0 + скорость из первого правила*/
    this.acceleration.add(cohesion);	/*Полученное значение + скорость из второго правила*/
    this.acceleration.add(separation);	/*Полученное значение + скорость из третьего правила*/

    /*Складываем в необходимую скорость объекта значения скорости, полученные из каждого правила*/
  }

  update() {	/*Функция обновления свойств объекта*/
    this.position.add(this.velocity);	/*Складываем текущее положение объекта с его направлением (Передвигаем объект)*/
    this.velocity.add(this.acceleration);	/*Складываем направление с ускорением*/
    this.acceleration.mult(0);	/*Обнуляем переменную, отвечающую за ускорение объекта*/
  }

  show() {	/*Отображение объекта*/
    strokeWeight(8);	/*Радиус объекта*/
    stroke(255);	/*Цвет объекта*/
    point(this.position.x, this.position.y);	/*Расположение объекта*/
  }
}

