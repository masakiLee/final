// 預設 JS，請同學不要修改此處

document.addEventListener("DOMContentLoaded", function () {
  const ele = document.querySelector(".recommendation-wall");
  ele.style.cursor = "grab";
  let pos = { top: 0, left: 0, x: 0, y: 0 };
  const mouseDownHandler = function (e) {
    ele.style.cursor = "grabbing";
    ele.style.userSelect = "none";

    pos = {
      left: ele.scrollLeft,
      top: ele.scrollTop,
      // Get the current mouse position
      x: e.clientX,
      y: e.clientY,
    };

    document.addEventListener("mousemove", mouseMoveHandler);
    document.addEventListener("mouseup", mouseUpHandler);
  };
  const mouseMoveHandler = function (e) {
    // How far the mouse has been moved
    const dx = e.clientX - pos.x;
    const dy = e.clientY - pos.y;

    // Scroll the element
    ele.scrollTop = pos.top - dy;
    ele.scrollLeft = pos.left - dx;
  };
  const mouseUpHandler = function () {
    ele.style.cursor = "grab";
    ele.style.removeProperty("user-select");

    document.removeEventListener("mousemove", mouseMoveHandler);
    document.removeEventListener("mouseup", mouseUpHandler);
  };
  // Attach the handler
  ele.addEventListener("mousedown", mouseDownHandler);
});
// menu 切換
let menuOpenBtn = document.querySelector(".menuToggle");
let linkBtn = document.querySelectorAll(".topBar-menu a");
let menu = document.querySelector(".topBar-menu");
menuOpenBtn.addEventListener("click", menuToggle);

linkBtn.forEach((item) => {
  item.addEventListener("click", closeMenu);
});

function menuToggle() {
  if (menu.classList.contains("openMenu")) {
    menu.classList.remove("openMenu");
  } else {
    menu.classList.add("openMenu");
  }
}
function closeMenu() {
  menu.classList.remove("openMenu");
}

// -----------------------------------------------------------------------------------

const productWrap = document.querySelector(".productWrap");
const productSelect = document.querySelector(".productSelect");
const shoppingCartTableList = document.querySelector(".shoppingCart-tableList");
let data = [];
let cartData = [];

axios
  .get(
    `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`
  )
  .then(function (response) {
    // 成功會回傳的內容
    // console.log(response.data.products);
    data = response.data.products;
    init(data);
  })
  .catch(function (error) {
    // 失敗會回傳的內容
    console.log(error);
  });

//初始化資料

function init(arr) {
  let str = "";
  arr.forEach(function (item) {
    str += proCard(item);
  });
  productWrap.innerHTML = str;
  getCartList();
}

function proCard(item) {
  return `<li class="productCard">
    <h4 class="productType">新品</h4>
    <img src="${item.images}"
        alt="">
    <a href="#" id="js-addCart" class="addCardBtn" data-id="${
      item.id
    }">加入購物車</a>
    <h3>${item.title}</h3>
    <del class="originPrice">NT$${toThousands(item.origin_price)}</del>
    <p class="nowPrice">NT$${toThousands(item.price)}</p>
  </li> `;
}

//篩選資料

productSelect.addEventListener("change", function (e) {
  let newData = data.filter(function (item) {
    return e.target.value === item.category || e.target.value === "全部";
  });
  let str = "";
  newData.forEach(function (item) {
    str += proCard(item);
  });
  productWrap.innerHTML = str;
});

productWrap.addEventListener("click", function (e) {
  e.preventDefault();
  let addCartClass = e.target.getAttribute("class");
  if (addCartClass !== "addCardBtn") {
    return;
  }
  let productId = e.target.getAttribute("data-id");
  console.log(productId);
  let numCheck = 1;
  cartData.forEach(function (item) {
    if (item.product.id === productId) {
      numCheck = item.quantity += 1;
    }
  });
  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`,
      {
        data: {
          productId: productId,
          quantity: numCheck,
        },
      }
    )
    .then(function (response) {
      alert("加入購物車");
      getCartList();
    });
});

// 取得購物車列表
function getCartList() {
  axios
    .get(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
    .then(function (response) {
      document.querySelector(".js-total").innerHTML = toThousands(
        response.data.finalTotal
      );

      cartData = response.data.carts;
      let str = "";
      cartData.forEach(function (item) {
        str += `
    <tr>
        <td>
            <div class="cardItem-title">
                <img src="${item.product.images}" alt="">
                <p>${toThousands(item.product.title)}</p>
            </div>
        </td>
        <td>NT$${toThousands(item.product.price)}</td>
        <td>${item.quantity}</td>
        <td>NT$${toThousands(item.product.price * item.quantity)}</td>
        <td class="discardBtn">
            <a href="#" class="material-icons" data-id="${item.id}">
                clear
            </a>
        </td>
    </tr>`;
      });

      shoppingCartTableList.innerHTML = str;
    });
}

// 刪除單品項
shoppingCartTableList.addEventListener("click", function (e) {
  e.preventDefault();
  const cartId = e.target.getAttribute("data-id");
  if (cartId == null) {
    return;
  }
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`
    )
    .then(function (response) {
      alert("成功刪除單筆購物車");
      getCartList();
    });
});

// 刪除全品項
const discardAllBtn = document.querySelector(".discardAllBtn");

discardAllBtn.addEventListener("click", function (e) {
  e.preventDefault();
  axios
    .delete(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`
    )
    .then(function (response) {
      alert("成功刪除全部購物車");
      getCartList();
    });
});

// 送出訂單

const orderInfoBtn = document.querySelector(".orderInfo-btn");
const orderInfoForm = document.querySelector(".orderInfo-form");
orderInfoBtn.addEventListener("click", function (e) {
  e.preventDefault();
  if (cartData == 0) {
    alert("請加入購物車");
  }

  const customerName = document.querySelector("#customerName").value;
  const customerPhone = document.querySelector("#customerPhone").value;
  const customerEmail = document.querySelector("#customerEmail").value;
  const customerAddress = document.querySelector("#customerAddress").value;
  const tradeWay = document.querySelector("#tradeWay").value;
  if (
    customerName == "" ||
    customerPhone == "" ||
    customerEmail == "" ||
    customerAddress == "" ||
    tradeWay == ""
  ) {
    alert("請輸入資料");
    return;
  }
  axios
    .post(
      `https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
      {
        data: {
          user: {
            name: customerName,
            tel: customerPhone,
            email: customerEmail,
            address: customerAddress,
            payment: tradeWay,
          },
        },
      }
    )
    .then(function (response) {
      alert("訂單成立");
      getCartList();
      orderInfoForm.reset();
    });
});

const inputs = document.querySelectorAll("input[name],select[data=payment]");

const form = document.querySelector(".orderInfo-form");
const constraints = {
  姓名: {
    presence: {
      message: "必填欄位",
    },
  },
  電話: {
    presence: {
      message: "必填欄位",
    },
    length: {
      minimum: 8,
      message: "需超過 8 碼",
    },
  },
  信箱: {
    presence: {
      message: "必填欄位",
    },
    email: {
      message: "格式錯誤",
    },
  },
  寄送地址: {
    presence: {
      message: "必填欄位",
    },
  },
  交易方式: {
    presence: {
      message: "必填欄位",
    },
  },
};

inputs.forEach((item) => {
  item.addEventListener("click", function () {
    item.nextElementSibling.textContent = "";
    let errors = validate(form, constraints) || "";
    console.log(errors);

    if (errors) {
      Object.keys(errors).forEach(function (keys) {
        // console.log(document.querySelector(`[data-message=${keys}]`));
        document.querySelector(`[data-message="${keys}"]`).textContent =
          errors[keys];
      });
    }
  });
});

// ----------------------- util js

function toThousands(x) {
  let parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}
