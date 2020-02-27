import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { Policy } from './entities/policy';
import { environment } from 'src/environments/environment';

export enum LetterStatus {
  withoutStatus = 'withoutStatus',
  onStartPostOffice = 'onStartPostOffice',
  inProgress = 'inProgress',
  onPromejutochniyPostOffice = 'onPromejutochniyPostOffice',
  onEndPostOffice = 'onEndPostOffice'
}

/*
Технологический процесс обработки корреспонденции
Прием письменной корреспонденции от потребителей может осуществляться следующими способами:
а) организацией автомобильных маршрутов по выемке писем из наружных почтовых ящиков;
б) городской служебной почтой (ГСП);
в) непосредственно в отделениях почтовой связи, объектах почтовой связи (передвижное ОПС и др.);
г) почтальонами.
Прием регистрируемых почтовых отправлений осуществляется в объектах почтовой связи, в основном в
отделениях почтовой связи, в присутствии отправителя. Оператор вносит в ПАК (программно-аппаратный
  комплекс) полную информацию о почтовом отправлении. Присваивает номер для системы слежения.

Определяется стоимость почтового отправления, и отправитель производит оплату (кроме корреспонденции с наложенным платежом).
После предварительной обработки оператором почтовые отправления приписываются к сопроводительным
документам и автотранспортом доставляется на дальнейшую обработку в исходящий узел связи (РУПС ПОПП,
   участок, цех). ОПП).
В исходящем узле связи осуществляется обработка и детальная сортировка отправлений по направлениям.
Параллельно с обработкой почты производится сличение почтовых отправлений с сопроводительными
бланками, а также оформляются новые сопроводительные документы. Информация о регистрируемых
почтовых отправлениях вносится в систему слежения республиканского унитарного предприятия почтовой
связи «Белпочта». Для обработки и сортировки почты в крупных сортировочных центрах существуют цеха
или участки, которые осуществляют обработку почты по ее видам, т. е. организованы выделенные
рабочие места. Также сортировка осуществляется детально по доставочным отделениям почтовой связи,
по районам
Обработанные в сортировочном узле почтовые отправления развозятся средствами местного транспорта по
 доставочным отделениям связи, районным (региональным) узлам почтовой связи.
В доставочном учреждении почтовой связи после вскрытия мешков находящиеся в них почтовые
отправления сверяются с записями накладной ф. 16, реестре. В ОПС данные о поступивших почтовых
отправлениях вносят в систему, оформляют извещения ф. ПС 22. Почтовые отправления раскладывают в
кладовке. Простая корреспонденция отдается почтальону для вручения.
После получения извещения или уведомления о прибытии почтового отправления получатель приходит в ОПС за ним с документами.

*/

export enum MejdunarondType { // think about it!
  simplePostLetter = 'simplePostLetter',
  /*
  − простые почтовые отправления – почтовые отправления,
  которые принимаются без выдачи квитанции и вручаются
  (доставляются) адресатам без расписки.
  */
  registrPostLetter = 'registrPostLetter',
  /*
  − регистрируемые почтовые отправления – почтовые отправления, при
  приеме которых отправителю выдается квитанция, отправления
  вручаются (доставляются) адресатам под расписку.

  Регистрируемые почтовые отправления имеют номер, состоящий из штрихкода с 13 знаками. Формат можно найти по ссылке

  https://ru.wikipedia.org/wiki/Почтовый_идентификатор .

  XX123456789YY
  */
  simpleOtslejivaemie = 'simpleOtslejivaemie'
  /*
  − простые отслеживаемые отправления – почтовые отправления, которым
  при приеме присваивается номер, сканируемый в систему слежения при
  приеме в стране подачи и при выдаче в стране назначения.
  */
}

export enum TypeOfLetter {
  pismo = 'pismo',
  /*
    Размер: для отправлений малого формата: минимальный – 90x140 мм. максимальный 165х245 мм,
     максимальная толщина 5 мм.: для отправлений большого формата: минимальный – 90x140 мм.
     максимальный 305х381 мм, максимальная толщина 20 мм.
  Предельный вес: 2 кг.
  Упаковка: Для упаковки писем используются только почтовые конверты, изготовленные согласно соответствующему стандарту.

  */
}

export enum LetterType {
  simple = 'simple',
  /*
  Характер вложения: разного рода письменные сообщения.
  Порядок отправления: простые письма опускаются отправителем в почтовый ящик. Письма с оттиском
  маркировальных и франкировальных машин сдаются на операционные кассы объектов почтовой связи.
  Порядок вручения: простые письма вручаются путем опускания в абонентский почтовый шкаф и индивидуальный почтовый ящик.
  */
  zakaz = 'zakaz',
  /*
  Характер вложения: разного рода письменные сообщения, деловые бумаги, фотографии,
  художественные открытки, схемы и другая аналогичная бумажная продукция.
  Порядок отправления: сдается на операционную кассу объекта почтовой связи с выдачей квитанции.
  Письму присваивается номер, что дает возможность получения информации о месте нахождении в любой
  момент времени посредством Интернет-сайта РУП «Белпочта» в разделе «Слежение за почтовыми
  отправлениями»
  Порядок вручения: вручается адресату под расписку, с предъявлением документа, удостоверяющего личность.
  Заказные письма, адресованные юридическим лицам, вручаются уполномоченным лицам на первых этажах
  здания или в объектах почтовой связи, в соответствии с заявлением юридического лица.

  При отправке заказного письма можно воспользоваться следующими услугами:
  – "С уведомлением о получении" – отправитель будет извещен, когда и кому (адресату или его доверенному лицу) вручено ваше отправление.
  – "Вручить лично" – пересылается с заказным уведомлением о получении с отметкой на отправлении
  "Вручить лично". Принимается только в адрес физических лиц на дом.
  Уведомления бывают:
  Простое – бланк уведомления пересылается и вручается отправителю как простое письмо.
  Заказное – бланк уведомления вручается отправителю под расписку.
  Электронное – информация о вручении отправления поступает отправителю на адрес электронной почты.
  */
 letterWithAnnouncedValue = 'letterWithAnnouncedValue'
  /*
  Характер вложения: ценные бумаги или документы (документы, удостоверяющие личность,
  свидетельства о регистрации актов гражданского состояния, водительские удостоверения, военные
  билеты и другие), облигации государственных займов, лотерейные билеты, грамоты, фотографии,
  художественные карточки, почтовые марки, рукописи, судебные и пенсионные дела, деловые бумаги,
  документы, имеющие ценность для отправителя и (или) адресата.
  Порядок отправления: сдается на операционную кассу объекта почтовой связи, по желанию отправителя
  с описью вложения в открытом виде, опечатывается, клиенту выдается квитанция. Письму
  присваивается номер, что дает возможность получения информации о месте нахождении в любой момент
  времени посредством Интернет-сайта РУП «Белпочта» в разделе «Слежение за почтовыми
  отправлениями». В случае утраты возмещается сумма в размере объявленной ценности
  Порядок вручения: вручается адресату под расписку, с предъявлением документа, удостоверяющего личность.
  */
}

export enum TypeOfUvedomlenie { // think who is who i kuda eto vsunut?
  /*
  Простое – бланк уведомления пересылается и вручается отправителю как простое письмо.
  Заказное – бланк уведомления вручается отправителю под расписку.
  Электронное – информация о вручении отправления поступает отправителю на адрес электронной почты.
  */
}
export enum SpecialMarkForZakazLetter {
  withUvedimoleniem = 'withUvedimoleniem',
  /*
  отправитель будет извещен, когда и кому (адресату или его доверенному лицу) вручено ваше отправление.
  */
  vruchitLichno = 'vruchitLichno'
  /*
  пересылается с заказным уведомлением о получении с отметкой на отправлении "Вручить лично".
  Принимается только в адрес физических лиц на дом.
  */
}

export enum TypeOfTown { // add new
  city = 'city',
  derevnya = 'derevnya',
  posiolok = 'posiolok'
}

export enum StreetType {
  prospect = 'prospect',
  ulica = 'ulica'
}

export enum SpecialMarkForValuenceLetter {
  /*
  – "С уведомлением о получении" – отправитель будет извещен, когда и кому (адресату или его доверенному лицу) вручено ваше отправление.
  – "Вручить лично" – пересылается с заказным уведомлением о вручении с отметкой на отправлении
  "Вручить лично". Принимается только в адрес физических лиц на дом.
  – "С наложенным платежом" – оператор почтовой связи обязуется получить с адресата сумму наложенного
  платежа, которую установит отправитель почтового отправления, и выслать ее денежным переводом по
  адресу указанному отправителем. Сумма наложенного платежа не может быть выше суммы объявленной
  ценности. Почтовые отправления с наложенным платежом от физических лиц в адрес юридических лиц не
  принимаются.

  */
}

export interface ManName {
  name: string;
  surname: string;
  otchestvo: string;
}
export interface Address {
  streetType?: StreetType; // enum
  streetName?: string;
  numberOfHouse: string;
  numberOfKorpus?: string;
  numberOfFlat?: string;
}
export interface NasPunktName {
  oblast: string; // область
  region?: string; // район
  townName: string; // город (название населеного пункта)
  typeOfTown: TypeOfTown;
  country: string;
}

export interface Letter { // please change this names and change these in form
  id: number;
  hash: string; // progs
  status: LetterStatus;
  isMejdunarond: string; // bool

  receiverAddress: {
    komu: ManName;
    kuda: Address;
    index: string;
    nasPunktName: NasPunktName;
  };

  otpravitelAddress: {
    otKogo: ManName,
    adress: Address & NasPunktName // may convert to Address and NasPunktName;
  };

  // typeOfLetter: TypeOfLetter; // вид отправления
  // letterType?: LetterType; // if typeOfLetter === TypeOfLetter.pismo
  // specialMarkForZakazLetter?: SpecialMarkForZakazLetter; // if typeOfLetter === TypeOfLetter.pismo && letterType === LetterType.zakaz
  // specialMarkForValuenceLetter: SpecialMarkForValuenceLetter;
  // if typeOfLetter === TypeOfLetter.pismo && letterType === LetterType.letterWithAnnouncedValue

  dateAndTimeOfStartWay: number;

  /*
  необходимо дописать случаи невозрвата (сроки хранения ожидается что они будут на сервере)
  */
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private httpClient: HttpClient) { }

  readPolicies(): Observable<Policy[]> {
    return this.httpClient.get<Policy[]>(`${environment.url}/api/read.php`);
  }

  createPolicy(policy: Policy): Observable<Policy> {
    return this.httpClient.post<Policy>(`${environment.url}/api/create.php`, policy);
  }

  updatePolicy(policy: Policy) {
    return this.httpClient.put<Policy>(`${environment.url}/api/update.php`, policy);
  }

  deletePolicy(id: number) {
    return this.httpClient.delete<Policy>(`${environment.url}/api/delete.php/?id=${id}`);
  }

  createLetter(letter: Letter) {
    return this.httpClient.post<Letter>(`${environment.url}/api/createLetter.php`, letter);
  }

  readLetters(): Observable<Letter[]> {
    return this.httpClient.get<Letter[]>(`${environment.url}/api/readLetter.php`);
  }


}
