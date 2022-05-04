function observerSubscribedButton(primeDate) {
	let containerToObserve = document.getElementsByTagName("body")[0];
	let options = {childList: true, subtree: true};
	let observer = new MutationObserver(mCallback);

	function mCallback(mutations) {
		// const subscriptionDate = document.querySelector('[data-test-selector="subscription-details__next-billing-or-lifetime-anniversary-date"]');
		const subscriptionBtn = document.querySelector('[data-test-selector="subscribe-button__dropdown"]');
		if (subscriptionBtn) {
		    observer.disconnect();
		    setSubscribedButtonContent(primeDate);
		}
	}
	
	observer.observe(containerToObserve, options);
}

function setSubscribedButtonContent(primeDate) {
	let subscriptionBtn = document.querySelector('[data-test-selector="subscribe-button__dropdown"]');
	let subscriptionBtnContent = subscriptionBtn.querySelector('[data-a-target="tw-core-button-label-text"]');
	subscriptionBtnContent.innerHTML = primeDate;
	
	let today = new Date();
	let todayDate = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
	
	let primeDateUpdated = new Date(primeDate.replace(/-/g,'/'));  
	let todayDateUpdated = new Date(todayDate.replace(/-/g,'/'));
	
	let tempsPrimeRestant = primeDateUpdated - todayDateUpdated;
	// console.log(Math.floor(millisecondsToDays(tempsPrimeRestant-1000))); // Arrondi inférieur
	// console.log(Math.ceil(millisecondsToDays(tempsPrimeRestant-1000))); // Arrondi supérieur
	
	let tempsPrimeRestantCeil = Math.ceil(millisecondsToDays(tempsPrimeRestant-1000));
	
	if (tempsPrimeRestantCeil < 0 || primeDate == "PRIME DISPO") {
		subscriptionBtnContent.innerHTML = "PRIME DISPO";
		subscriptionBtn.classList.add("primeDispo");
	}
	else
		subscriptionBtnContent.innerHTML = "Prime dispo dans " + tempsPrimeRestantCeil + " jours";
}

function millisecondsToDays(milliseconds) {
  //         👇️        hour  min  sec  ms
  return milliseconds / 24 / 60 / 60 / 1000;
}

function getMonthNumber(month) {
	let months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
	let i = 0;
	while (i < months.length) {
		if (month == months[i]) {
			// month = leftFillNum(i+1,2);
			month = i+1;
			return month;
			break
		}
		i++;
	}
}

function leftFillNum(num, targetLength) {
  return num.toString().padStart(targetLength, '0');
}

function setPrimeDateToLS() {
	let primeDate = JSON.parse(localStorage.getItem('primeDate'));
	if (!primeDate){
		const currentURL = window.location.href;
		const currentShortURL = currentURL.split('?')[0];
		if (currentShortURL != "https://www.twitch.tv/subscriptions") {
			alert("Vous allez être redirigé pour permettre le parametrage de la date d'abonnement Prime");
			window.location = "https://www.twitch.tv/subscriptions?tab=paid&paramPrimeDate=true";
		}
		else {
			let params = (new URL(document.location)).searchParams;
			let paramPrimeDate = params.get('paramPrimeDate');
			if (paramPrimeDate == "true") {
				observerSubscriptionCardList();
			}
		}
	}
	else {
		observerSubscribedButton(primeDate);
	}
}

function observerSubscriptionCardList() {
	let containerToObserve = document.getElementsByTagName("body")[0];
	let options = {childList: true, subtree: true};
	let observer = new MutationObserver(mCallback);
	
	function mCallback(mutations) {
		const subscriptionCardListLoaded = document.querySelector('h2').parentNode.childNodes[2].childNodes[0].childNodes[0].childNodes[0];
		const subscriptionCardList = document.querySelector('h2').parentNode.childNodes[2].childNodes[0];
		if (subscriptionCardListLoaded) {
		    observer.disconnect();
		    LsConfig(subscriptionCardList);
		}
	}
	
	observer.observe(containerToObserve, options);
}

function LsConfig(subscriptionCardList) {
	let primeDateEntire = subscriptionCardList.querySelector('.tier-display__prime').closest(".tw-card-body").childNodes[1].childNodes[6].childNodes[0].childNodes[0].childNodes[1].querySelector('span').textContent;
	if (primeDateEntire) {
		primeDateEntire = primeDateEntire.replace(/\xA0/g,' ');
		const primeDate = primeDateEntire.split(' ')[2] + "-" + getMonthNumber(primeDateEntire.split(' ')[1]) + "-" + primeDateEntire.split(' ')[0];
	}
	else {
		const primeDate = "PRIME DISPO";
	}
	localStorage.setItem('primeDate', JSON.stringify(primeDate));
	alert("La date d'abonnement Prime est maintenant prise en compte \nDate d'expiration : " + primeDate);
}

setPrimeDateToLS();


//Chargement de "setPrimeDateToLS" après le chargement complet de la page
window.onload = function () {
	setPrimeDateToLS();
}

//Chargement de "main" après un chanhement d'URL
window.addEventListener('locationchange', function () {
	location.reload();
});

//This modifies these three functions so that all fire a custom locationchange event for you to use, and also pushstate and replacestate events if you want to use those.
(() => {
    let oldPushState = history.pushState;
    history.pushState = function pushState() {
        let ret = oldPushState.apply(this, arguments);
        window.dispatchEvent(new Event('pushstate'));
        window.dispatchEvent(new Event('locationchange'));
        return ret;
    };
    window.addEventListener('popstate', () => {
        window.dispatchEvent(new Event('locationchange'));
    });
})();