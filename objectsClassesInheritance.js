'use strict';

(function () {
    propertyFlags();
    gettersAndSetters();
    inheritance();
    prototypeProperty();
    prototypeBasedClass();
    classPattern();
    classInheritance();
    superInheritalsAndHomeObject();
    instanceOf();
})();

// note: For instance, when we create an array [1, 2, 3], the default new Array() constructor is used internally

function propertyFlags() {

    const user = {
        name: 'Adam',
    };

    let defaultPropertySettings = Object.getOwnPropertyDescriptor(user, 'name');
    Object.defineProperty(user, 'name', {
        value: 'admin',
        writable: false,
        enumerable: true,
        configurable: false // after this, we never can define properties of 'name' property
    });
    Object.defineProperties(user, { // define multiple properties
        surname: { value: 'lasak', writable: true },
        birth: { value: '1996-07-22', configurable: false },
    });
    defaultPropertySettings = Object.getOwnPropertyDescriptor(user, 'name');
    // user.name = 'adam'; // error occurs - still will be 'admin'

    const potentialClone = Object.defineProperties({}, Object.getOwnPropertyDescriptors(user));

    user.address = 'Koberice, Nadrazni 35';
    Object.preventExtensions(user); // cannot add properties
    // user.sth = 'sth'; // error - object is not extensible, 'sth' property will not be added
    Object.seal(user); // cannot add/remove properties
    // delete user.address; // Cannot delete property 'address' of #<Object>
    Object.freeze(user); // cannot add/remove/change properties
    // user.address = 'Koberice, Nadrazni 350/35'; // error - cannot assign to read only property 'address' of object '#<Object>'

    const isExtensible = Object.isExtensible(user); // returns false if adding properties is forbidden, otherwise true.
    const isSealed = Object.isSealed(user); // returns true if adding/removing properties is forbidden, and all existing properties have configurable: false.
    const isFrozen = Object.isFrozen(user); // returns true if adding/removing/changing properties is forbidden, and all current properties are configurable: false, writable: false.

}

function gettersAndSetters() {

    // property can be either an accessor or a data property
    // getter and setter also can be defined in Object.defineProperty(...)
    // properties with underscore before are technicaly accessible outside, but it can be understand as internal variable
    const user = {
        _name: 'Till', // data property
        _surname: 'Lindemann', // data property
        get fullName() { // accessor
            return `${this._name} ${this._surname}`;
        },
        set fullName(value) { // accessor
            if (value.length < 4) {
                return;
            }
            [this._name, this._surname] = value.split(' ');
        },
    }

    Object.defineProperty(user, 'toString', {
        get() {
            return `[${new Date().getFullYear()}] ${this.fullName}`;
        }
    });

    const fullName = user.fullName; // not user.fullName()
    user.fullName = 'Adam Lasak';
    const toString = user.toString;

}

function inheritance() {

    // objects have a special hidden property [[Prototype]], that is either null 
    // or references another object. That object is called “a prototype”:
    // ...simplify it's reference to ancestor object
    // [[Prototype]] can be set as __proto__ = obj;

    const user = {
        name: "John",
        surname: "Smith",

        set fullName(value) {
            [this.name, this.surname] = value.split(' ');
        },

        get fullName() {
            return `${this.name} ${this.surname}`;
        },
    };

    const admin = {
        __proto__: user,
        isAdmin: true,
    };

    const superAdmin = {
        __proto__: user, // if we replace the default prototype as a whole, then there will be no "constructor" in it.
        isSuperAdmin: true,
    }

    const adminPreviousName = admin.fullName;
    admin.fullName = 'Adam Lasak';
    const currentAdmin = admin.fullName;
}

function prototypeProperty() {

    // NOTE: for null and undefined are not protypes
    //       for string, number, boolean are, like String.prototype, etc. => they are wrappers for primitive types

    // every function has a prototype property with a value of the object type, then new operator 
    // uses it to set [[Prototype]] for the new object.
    const animal = {
        [Symbol("id")]: 'id',
        eats: true
    };

    const extendedAnimal = Object.create(animal, { hunt: { value: true } });

    const sth = {
        sth: 'sth'
    }

    function Rabbit(name) { // inherit from Function which inherit from Object
        this.name = name;
    }
    function Horse(name) { }

    sth.prototype = animal; // for object it only create a 'prototype' property, which is NOT __proto__
    const horse = new Horse('sth');

    // whne we have an object, don’t know which constructor was used for it (e.g. it comes from a 3rd party library), and we need to create another one of the same kind.
    const horseFromConstructor = new horse.constructor('sth2');

    const referenceToItself = Horse.prototype.constructor === Horse; // the default "prototype" is an object with the only property constructor that points back to the function itself.
    const referenceFromDescendant = horse.constructor === Horse;
    const everythingInheritFromObject = [].__proto__.__proto__ === Object.prototype;

    Rabbit.prototype = animal;

    // Not overwrite Rabbit.prototype totally, just add to it. The default Rabbit.prototype.constructor is preserved
    Rabbit.prototype.jumps = true; // add the property into ancestor too

    const rabbit = new Rabbit("White Rabbit"); //  rabbit.__proto__ == animal

    String.prototype.helloWorld = function () { // we can add methods and properties to main ancestor objects, but it's not recomended
        return `Hello world! ${this}`;
    }

    const customFunctionInPrototype = "Adam".helloWorld();

    function makeString() {
        // The central benefit of function borrowing is that it allows you to forego inheritance. 
        // There’s no reason for you to force a class to inherit from another if you’re only doing so in order to 
        // grant instances of the child class access to a single method.

        // return [].join.call(arguments, ' - ');
        return Array.prototype.join.call(arguments, ' - '); // same, only with using prototypes
    }

    const borrowingFunction = makeString('adam', 'lasak', '96');

    // __proto__=sth is slower (it's created in run time), rather use Object.create(...)
    // Object.assign(...) copy methods form one object (f.e. prototype) to another
    const correctCreatedDescendant = Object.create(animal, { // first param is ancestor (prototype), // second param [optional] is object of additional properties in descendant
        run: { value: true, writable: false }, // this line is property descriptor
    });

    const correctClone = Object.create(
        Object.getPrototypeOf(correctCreatedDescendant),
        Object.getOwnPropertyDescriptors(correctCreatedDescendant)
    );

    Object.setPrototypeOf(correctClone, correctCreatedDescendant);

    // NOTE: setPrototypeOf, getPrototypeOf, create are newest function for managing prototypes, should by used
    //       Object.create(...) set __proto__ only once at instance, JS core is optimized for this, changig __proto__ during runtime is slower

    const correctCreatedObject = Object.create(Array.prototype); // in this case - array
    const veryPlainObject = Object.create(null); // very plain object

    const getOwnPropertySymbols = Object.getOwnPropertySymbols(animal); // get all symbols property
    const getOwnPropertyNames = Object.getOwnPropertyNames(extendedAnimal); // get only own properties, not inherited
    const hasOwnProperty = extendedAnimal.hasOwnProperty('eats'); // OWN means not inherited properties, so extendedAnimal doesn't have 'eats' property
    const ownKeys = Reflect.ownKeys(animal); // get all properties, including symbols and enumerable items

}

function prototypeBasedClass() {

    function User(name) {
        [this.name, this.surname] = name.split(' '); // private properties
    }
    User.prototype.toString = function () { // public method
        return `prototype-based class: ${this.name} ${this.surname}`;
    }

    const user = new User('Adam Lasak');
    console.log(user.toString());

}

function classPattern() {

    class User { // use strict have to be set
        constructor(name) {
            [this.name, this.surname] = name.split(' ');
        }

        get Name() {
            return this.name;
        }

        set Name(value) {
            this.name = value.length > 3 ? value : null;
        }

        toString() {
            return `class: ${this.name} ${this.surname}`;
        }

        static author() { // function's property...User.author = function() {...}
            return `Created 2018 | Adam Lasak`;
        }
    }

    User.prototype.test = 'static variable'; // visible in all instances

    const user = new User('Adam Lasak');
    const user2 = new User('Valentina Selzerova');
    const author = User.author();
    const visibleStaticProperty = user.test === user2.test; // true
    console.log(user.toString());

    const userIsConstructorFunction = (User === User.prototype.constructor); // true, constructor refers to prototype
    const userProperties = Object.getOwnPropertyNames(User.prototype);
}

function classInheritance() {

    class User {
        constructor(login, passwd) { this.login = login; this.password = passwd; }
        get Login() { return this.login; }
        get Password() { return this.password; }
        toString() { return `${this.login}`; }
    }

    class Admin extends User {
        constructor() {
            super('lasakada', 'admin');
            this.isAdmin = true;
        }
        get IsAdmin() { return this.isAdmin; }
        set IsAdmin(value) { this.isAdmin = value; }
        toString() {
            return super.toString() + ', isAdmin: ' + this.isAdmin;
        }
    }

    const admin = new Admin();
    const adminString = admin.toString();

}

function superInheritalsAndHomeObject() {

    const User = {
        login: 'user01',
        toString() {
            return `[user] ${this.login}`;
        }
    }

    const Admin = {
        __proto__: User,
        toString() { // [[HomeObject]] === Admin, method must be write as method(...) {} not like method: function() {}
            // like super.toString()
            // simply call this.__proto__.toString()  would execute parent toString in the context of the prototype, not the current object.
            // we want to call it in context of current object
            const superResult = this.__proto__.toString.call(this); // which is => Admin.__proto__...
            return superResult + ' descendant';
        }
    }

    const Student = {
        __proto__: Admin,
        toString() { // [[HomeObject]] === Studnet, method must be write as method(...) {} not like method: function() {}
            // like super.toString()
            const superResult = this.__proto__.toString.call(this); // which is => Student.__proto__...
            // with call(this) in calling Admin.toString() will be this=Student, there will be endless loop
            return superResult + ' descendant\'s descendant';
        }
    }

    // const admin = new Admin(); // TypeError: Admin is not a constructor - it's just an object
    const returnedStringDescendant = Admin.toString();
    // const returnedStringDescendant2 = Student.toString(); // RangeError: Maximum call stack size exceeded, in case of calling super.toString() there won't be error

}

function instanceOf() {

    class Animal { };
    class Rabbit extends Animal { };

    // Class.prototype.isPrototypeOf(obj)
    const instanceOf1 = new Animal() instanceof Animal; // true
    const instanceOf2 = new Rabbit() instanceof Animal; // true
    const instanceOf3 = new Rabbit() instanceof Rabbit; // true
    // if we change Class.prototype = {}, the instanceof won't work anymore
    // that’s one of the reasons to avoid changing prototype


    // NOTE: use instanceof for custom types: classes, objects
    //       use typeof for simple built in types: strings, numbers, booleans // Boolean, String, .. are wrappers for simple data-types for reason of using methods like toString(), etc.
    const instanceOf4 = 'sth' instanceof String; // false
    const intsanceOf5 = 3.14 instanceof Number; // false
    const instanceOf6 = true instanceof Boolean // false

    const typeOf1 = typeof 'sth' === 'string'; // true
    const typeOf2 = typeof 3.14 === 'number'; // true
    const typeOf3 = typeof true === 'boolean'; // true

}