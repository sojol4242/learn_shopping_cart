// variables:
// cart
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
// clearCartBtn.addEventListener('click', () => {

// })
const cartDom = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartItem = document.querySelector('.cart-item');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
// products
const productsDom = document.querySelector('.products-center');


// cart
let cart = [];
let buttonsDom;

// getting the products:
class Products {
    async getProducts() {
        try {
            let result = await fetch('products.json')
            let data = await result.json();
            let products = data.items;
            products = products.map(item => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return { title, price, id, image }
            })
            return products;
        } catch (error) {
            console.log(error);
        }

    }
}
// display products:

class UI {
    displayProducts(products) {
        let result = ``;
        products.forEach(product => {
            result += `
            <article class="product">
            <div class="img-container">
                <img src="${product.image}" alt="products-1" class="product-img">

                <button class="bag-btn" data-id="${product.id}">
         <i class="fas fa-shopping-cart">
            add to cart
        </i>
        </button>
            </div>
            <h3>${product.title}</h3>
            <h4>$${product.price}</h4>
        </article>`;
        });
        productsDom.innerHTML = result;
        // console.log(products);
    }

    getBagButtons() {
        const btns = [...document.querySelectorAll(".bag-btn")];
        // console.log(btns);
        buttonsDom = btns;
        btns.forEach(btn => {
            let id = btn.dataset.id;
            let inCart = cart.find(item => {
                item.id === id
            })
            if (inCart) {
                btn.innerText = "In Cart";
                btn.disabled = true;
            } else {
                btn.addEventListener('click', (event) => {
                    event.target.innerText = " In cart";
                    event.target.disabled = true;
                    // get product from products
                    let cartItem = {...Storage.getProduct(id), amount: 1 };

                    // add product to cart

                    cart = [...cart, cartItem];

                    // save cart in local storage;
                    Storage.saveCart(cart);

                    // set cart value
                    this.setCartValues(cart);

                    // display cart item
                    this.addCartItem(cartItem);
                    //show  the cart
                    this.showCart();
                })
            }
        });
    }
    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        })
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        cartItems.innerText = itemsTotal;
        console.log(cartTotal, cartItems);

    }
    addCartItem(item) {
        const div = document.createElement('div');
        div.classList.add("cart-item");
        div.innerHTML = `<img src="${item.image}" alt="product1-cart">
        <div>
            <h4>${item.title}</h4>
            <h5>$ ${item.price}</h5>
            <span class="remove-item" data-id="${item.id}">remove</span>
        </div>
        <div>
            <i class="fas fa-chevron-up upArrow" data-id="${item.id}"></i>
            <p class="item-amount" data-id="${item.id}"> ${item.amount} </p>
            <i class="fas fa-chevron-down downArrow" data-id="${item.id}"></i>
        </div>`;
        cartContent.appendChild(div);

    }
    showCart() {
        cartOverlay.classList.add("transparentBcg")
        cartDom.classList.add("showCart")
    }
    hideCart() {
        cartOverlay.classList.remove("transparentBcg")
        cartDom.classList.remove("showCart")
    }
    setupAPP() {
        cart = Storage.getCart();
        this.setCartValues(cart);
        this.populate(cart);
        // callback
        cartBtn.addEventListener("click", this.showCart);
        closeCartBtn.addEventListener("click", this.hideCart);
    }
    populate(cart) {

        cart.forEach(item => this.addCartItem(item));

    }

    // cart calculation;
    cartLogic() {
            clearCartBtn.addEventListener("click", () => {
                this.clearCart();
            })
            cartContent.addEventListener("click", event => {
                if (event.target.classList.contains("remove-item")) {
                    let removeItem = event.target;
                    // console.log(removeItem);
                    let id = removeItem.dataset.id;
                    cartContent.removeChild(removeItem.parentElement.parentElement)
                    this.removeItem(id);

                }
                //increase
                else if (event.target.classList.contains("upArrow")) {
                    let addAmount = event.target;
                    let id = addAmount.dataset.id;
                    let tempItem = cart.find(item => item.id === id);
                    tempItem.amount = tempItem.amount + 1;

                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    addAmount.nextElementSibling.innerText = tempItem.amount;

                }
                // decrease
                else if (event.target.classList.contains("downArrow")) {
                    let removeAmount = event.target;
                    let id = removeAmount.dataset.id;
                    let tempItem = cart.find(item => item.id === id);
                    tempItem.amount = tempItem.amount - 1;

                    if (tempItem.amount < 0) {
                        cartContent.removeChild(removeAmount.parentElement.parentElement);
                        this.removeItem(id);
                    } else {
                        Storage.saveCart(cart);
                        this.setCartValues(cart);
                        removeAmount.previousElementSibling.innerText = tempItem.amount;
                    }
                    // Storage.saveCart(cart);
                    // this.setCartValues(cart);
                    // removeAmount.nextElementSibling.innerText = tempItem.amount;
                }
            })

        }
        // cart remove increase decrease:


    // clear cart
    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0])
        }
        this.hideCart();
    }

    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleBtn(id);
        button.disabled = false;
        button.innerHTML = `<i class="fas fa-shopping-cart></i> Add To Cart`
    }
    getSingleBtn(id) {
        return buttonsDom.find(button => button.dataset.id === id)
    }
}

// local storage:

class Storage {

    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products))
    }
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem("products"));

        return products.find(product => product.id == id);
    }
    static saveCart() {
        localStorage.setItem("cart", JSON.stringify(cart))
    }
    static getCart() {
        return localStorage.getItem("cart") ? JSON.parse(localStorage.getItem("cart")) : []
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const ui = new UI();

    const products = new Products();
    // setupAPP
    ui.setupAPP();

    // get All products;
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });
});