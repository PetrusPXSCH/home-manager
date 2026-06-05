self.addEventListener("push", function (event) {
  const data = event.data ? event.data.json() : {};

  event.waitUntil(
    self.registration.showNotification(data.title || "Home Manager", {
      body: data.body || "Nouvelle notification",
      icon: "/icon.png",
      badge: "/icon.png",
      data: {
        url: data.url || "/",
      },
    })
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url || "/")
  );
});