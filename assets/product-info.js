customElements.get("product-info")||customElements.define("product-info",class extends HTMLElement{quantityInput=void 0;quantityForm=void 0;onVariantChangeUnsubscriber=void 0;cartUpdateUnsubscriber=void 0;abortController=void 0;pendingRequestUrl=null;preProcessHtmlCallbacks=[];postProcessHtmlCallbacks=[];constructor(){super(),this.quantityInput=this.querySelector(".quantity__input")}connectedCallback(){this.initializeProductSwapUtility(),this.onVariantChangeUnsubscriber=subscribe(PUB_SUB_EVENTS.optionValueSelectionChange,this.handleOptionValueChange.bind(this)),this.initQuantityHandlers(),this.dispatchEvent(new CustomEvent("product-info:loaded",{bubbles:!0}))}addPreProcessCallback(t){this.preProcessHtmlCallbacks.push(t)}initQuantityHandlers(){this.quantityInput&&(this.quantityForm=this.querySelector(".product-form__quantity"),this.quantityForm)&&(this.setQuantityBoundries(),this.dataset.originalSection||(this.cartUpdateUnsubscriber=subscribe(PUB_SUB_EVENTS.cartUpdate,this.fetchQuantityRules.bind(this))))}disconnectedCallback(){this.onVariantChangeUnsubscriber(),this.cartUpdateUnsubscriber?.()}initializeProductSwapUtility(){this.preProcessHtmlCallbacks.push(t=>t.querySelectorAll(".scroll-trigger").forEach(t=>t.classList.add("scroll-trigger--cancel"))),this.postProcessHtmlCallbacks.push(t=>{window?.Shopify?.PaymentButton?.init(),window?.ProductModel?.loadShopifyXR()})}handleOptionValueChange({data:{event:t,target:e,selectedOptionValues:i}}){var a,r;this.contains(t.target)&&(this.resetProductFormState(),t=e.dataset.productUrl||this.pendingRequestUrl||this.dataset.url,this.pendingRequestUrl=t,a=this.dataset.url!==t,r="true"===this.dataset.updateUrl&&a,this.renderProductInfo({requestUrl:this.buildRequestUrlWithParams(t,i,r),targetId:e.id,callback:a?this.handleSwapProduct(t,r):this.handleUpdateProductInfo(t)}))}resetProductFormState(){var t=this.productForm;t?.toggleSubmitButton(!0),t?.handleErrorMessage()}handleSwapProduct(i,a){return t=>{this.productModal?.remove();var e=this.getSelectedVariant(t.querySelector(a?"product-info[id^='MainProduct']":"product-info"));this.updateURL(i,e?.id),a?(document.querySelector("head title").innerHTML=t.querySelector("head title").innerHTML,HTMLUpdateUtility.viewTransition(document.querySelector("main"),t.querySelector("main"),this.preProcessHtmlCallbacks,this.postProcessHtmlCallbacks)):HTMLUpdateUtility.viewTransition(this,t.querySelector("product-info"),this.preProcessHtmlCallbacks,this.postProcessHtmlCallbacks)}}renderProductInfo({requestUrl:t,targetId:e,callback:i}){this.abortController?.abort(),this.abortController=new AbortController,fetch(t,{signal:this.abortController.signal}).then(t=>t.text()).then(t=>{this.pendingRequestUrl=null;t=(new DOMParser).parseFromString(t,"text/html");i(t)}).then(()=>{document.querySelector("#"+e)?.focus()}).catch(t=>{"AbortError"===t.name?console.log("Fetch aborted by user"):console.error(t)})}getSelectedVariant(t){t=t.querySelector("variant-selects [data-selected-variant]")?.innerHTML;return t?JSON.parse(t):null}buildRequestUrlWithParams(t,e,i=!1){var a=[];return i||a.push("section_id="+this.sectionId),e.length&&a.push("option_values="+e.join(",")),t+"?"+a.join("&")}updateOptionValues(t){t=t.querySelector("variant-selects");t&&HTMLUpdateUtility.viewTransition(this.variantSelectors,t,this.preProcessHtmlCallbacks)}handleUpdateProductInfo(i){return a=>{var t,e=this.getSelectedVariant(a);this.pickupAvailability?.update(e),this.updateOptionValues(a),this.updateURL(i,e?.id),this.updateVariantInputs(e?.id),e?(this.updateMedia(a,e?.featured_media?.id),(t=(t,e=t=>!1)=>{var i=a.getElementById(t+"-"+this.sectionId),t=this.querySelector(`#${t}-`+this.dataset.section);i&&t&&(t.innerHTML=i.innerHTML,t.classList.toggle("hidden",e(i)))})("price"),t("Sku",({classList:t})=>t.contains("hidden")),t("Inventory",({innerText:t})=>""===t),t("Volume"),t("Price-Per-Item",({classList:t})=>t.contains("hidden")),this.updateQuantityRules(this.sectionId,a),this.querySelector("#Quantity-Rules-"+this.dataset.section)?.classList.remove("hidden"),this.querySelector("#Volume-Note-"+this.dataset.section)?.classList.remove("hidden"),this.productForm?.toggleSubmitButton(a.getElementById("ProductSubmitButton-"+this.sectionId)?.hasAttribute("disabled")??!0,window.variantStrings.soldOut),publish(PUB_SUB_EVENTS.variantChange,{data:{sectionId:this.sectionId,html:a,variant:e}})):this.setUnavailable()}}updateVariantInputs(e){this.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment-`+this.dataset.section).forEach(t=>{t=t.querySelector('input[name="id"]');t.value=e??"",t.dispatchEvent(new Event("change",{bubbles:!0}))})}updateURL(t,e){this.querySelector("share-button")?.updateUrl(""+window.shopUrl+t+(e?"?variant="+e:"")),"false"!==this.dataset.updateUrl&&window.history.replaceState({},"",t+(e?"?variant="+e:""))}setUnavailable(){this.productForm?.toggleSubmitButton(!0,window.variantStrings.unavailable);var t=["price","Inventory","Sku","Price-Per-Item","Volume-Note","Volume","Quantity-Rules"].map(t=>`#${t}-`+this.dataset.section).join(", ");document.querySelectorAll(t).forEach(({classList:t})=>t.add("hidden"))}updateMedia(t,e){if(e){let s=this.querySelector("media-gallery ul");var o=t.querySelector("media-gallery ul");let n=()=>{this.hasAttribute("data-zoom-on-hover")&&enableZoomOnHover(2);var t=Array.from(s.querySelectorAll("li[data-media-id]")),e=new Set(t.map(t=>t.dataset.mediaId)),i=new Map(t.map((t,e)=>[t.dataset.mediaId,{item:t,index:e}]));return[t,e,i]};if(s&&o){let[i,a,r]=n();var l=Array.from(o.querySelectorAll("li[data-media-id]")),u=new Set(l.map(({dataset:t})=>t.mediaId));let e=!1;for(let t=l.length-1;0<=t;t--)a.has(l[t].dataset.mediaId)||(s.prepend(l[t]),e=!0);for(let t=0;t<i.length;t++)u.has(i[t].dataset.mediaId)||(i[t].remove(),e=!0);e&&([i,a,r]=n()),l.forEach((t,e)=>{t=r.get(t.dataset.mediaId);t&&t.index!==e&&(s.insertBefore(t.item,s.querySelector(`li:nth-of-type(${e+1})`)),[i,a,r]=n())})}this.querySelector("media-gallery")?.setActiveMedia?.(this.dataset.section+"-"+e,!0);o=this.productModal?.querySelector(".product-media-modal__content"),e=t.querySelector("product-modal .product-media-modal__content");o&&e&&(o.innerHTML=e.innerHTML)}}setQuantityBoundries(){var t={cartQuantity:this.quantityInput.dataset.cartQuantity?parseInt(this.quantityInput.dataset.cartQuantity):0,min:this.quantityInput.dataset.min?parseInt(this.quantityInput.dataset.min):1,max:this.quantityInput.dataset.max?parseInt(this.quantityInput.dataset.max):null,step:this.quantityInput.step?parseInt(this.quantityInput.step):1};let e=t.min;var i=null===t.max?t.max:t.max-t.cartQuantity;null!==i&&(e=Math.min(e,i)),t.min<=t.cartQuantity&&(e=Math.min(e,t.step)),this.quantityInput.min=e,i?this.quantityInput.max=i:this.quantityInput.removeAttribute("max"),this.quantityInput.value=e,publish(PUB_SUB_EVENTS.quantityUpdate,void 0)}fetchQuantityRules(){var t=this.productForm?.variantIdInput?.value;t&&(this.querySelector(".quantity__rules-cart .loading__spinner").classList.remove("hidden"),fetch(this.dataset.url+`?variant=${t}&section_id=`+this.dataset.section).then(t=>t.text()).then(t=>{t=(new DOMParser).parseFromString(t,"text/html");this.updateQuantityRules(this.dataset.section,t)}).catch(t=>console.error(t)).finally(()=>this.querySelector(".quantity__rules-cart .loading__spinner").classList.add("hidden")))}updateQuantityRules(t,e){if(this.quantityInput){this.setQuantityBoundries();var i,a=e.getElementById("Quantity-Form-"+t);for(i of[".quantity__input",".quantity__rules",".quantity__label"]){var r,s=this.quantityForm.querySelector(i),n=a.querySelector(i);if(s&&n)if(".quantity__input"===i)for(r of["data-cart-quantity","data-min","data-max","step"]){var o=n.getAttribute(r);null!==o?s.setAttribute(r,o):s.removeAttribute(r)}else s.innerHTML=n.innerHTML}}}get productForm(){return this.querySelector("product-form")}get productModal(){return document.querySelector("#ProductModal-"+this.dataset.section)}get pickupAvailability(){return this.querySelector("pickup-availability")}get variantSelectors(){return this.querySelector("variant-selects")}get relatedProducts(){var t=SectionId.getIdForSection(SectionId.parseId(this.sectionId),"related-products");return document.querySelector(`product-recommendations[data-section-id^="${t}"]`)}get quickOrderList(){var t=SectionId.getIdForSection(SectionId.parseId(this.sectionId),"quick_order_list");return document.querySelector(`quick-order-list[data-id^="${t}"]`)}get sectionId(){return this.dataset.originalSection||this.dataset.section}});