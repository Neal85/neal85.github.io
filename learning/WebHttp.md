


## Cookie
不应该出现 Cookie 跨站使用。
SameSite 可以有下面三种值：
1. Strict 仅允许一方请求携带 Cookie，即浏览器将只发送相同站点请求的 Cookie，即当前网页 URL 与请求目标 URL 完全一致。
2. Lax 允许部分第三方请求携带 Cookie。
3. None 无论是否跨站都会发送 Cookie。


## HTTPS 握手
1. 首先，浏览器会向服务器发送一个Client Hello消息，其中包含浏览器支持的 TLS 版本、加密算法集以及一个随机数。

1. 接着，服务器会回应一个Server Hello消息，其中包含双方共同支持的 TLS 版本、加密算法集和另一个随机数。

1. 然后，服务器会发送一个Certificate消息，其中附加了服务器的证书。这个证书用于证明服务器的身份，确保浏览器连接的是真实的、可信任的服务器。浏览器在接收到证书后，会对其进行验证，以确保其有效性。

1. 在证书验证通过后，浏览器会使用证书中附带的公钥生成一个pre-master secret，并将其作为Client Key Exchange消息体发送给服务器。这个pre-master secret是后续生成加密密钥的重要基础。

1. 服务器在收到pre-master secret后，会使用自己的私钥进行解密，得到原始的pre-master secret。然后，服务器和浏览器会使用这个pre-master secret和之前收到的对方的随机数，共同生成一个相同的master key。这个master key将用于加密和解密后续所有的通信数据。

1. 接下来，浏览器会发送一个Change Cipher Spec消息，告知服务器已准备好使用新的加密密钥进行通信。紧接着，浏览器会发送一个使用master key加密的Finished消息，以验证加密密钥的正确性。

1. 服务器在接收到这些消息后，也会进行相应的验证和处理。一旦验证通过，服务器会同样发送一个Change Cipher Spec消息和一个使用master key加密的Finished消息给浏览器，表示握手过程已完成，双方已建立起安全的通信通道。

1. 至此，HTTPS 的握手过程就告一段落了。
